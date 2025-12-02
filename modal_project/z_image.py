import modal

# 定义要下载的模型ID
MODEL_ID = "Tongyi-MAI/Z-Image-Turbo"

# ==============================================================================
# 1. 定义 GPU 镜像
# ==============================================================================
def download_model_to_image():
    from huggingface_hub import snapshot_download
    print(f"正在构建镜像时下载模型: {MODEL_ID} ...")
    snapshot_download(repo_id=MODEL_ID, ignore_patterns=["*.msgpack", "*.bin", "*.h5"])

image_gpu = (
    modal.Image.debian_slim(python_version="3.10")
    .run_commands("python -m pip install --upgrade pip")
    .apt_install("git")
    .pip_install(
        "torch",
        "torchvision",
        extra_index_url="https://download.pytorch.org/whl/cu121"
    )
    .pip_install(
        "transformers", 
        "accelerate", 
        "sentencepiece", 
        "huggingface_hub", 
        "protobuf"
    )
    .pip_install("git+https://github.com/huggingface/diffusers.git")
    .run_function(download_model_to_image)
    .env({"PYTORCH_ALLOC_CONF": "expandable_segments:True"})
)

app = modal.App("z-image-turbo-api", image=image_gpu)

# ==============================================================================
# 2. 核心推理逻辑 (通用引擎)
#    这个类不绑定具体显卡，只负责加载模型和画图，供后面两个类调用
# ==============================================================================
class InferenceEngine:
    def load_model(self):
        import torch
        from diffusers import ZImagePipeline
        
        print("🚀 正在加载模型核心...")
        self.pipe = ZImagePipeline.from_pretrained(
            MODEL_ID,
            torch_dtype=torch.bfloat16,
            low_cpu_mem_usage=True,
            local_files_only=True,
        )
        self.pipe.enable_sequential_cpu_offload()
        print("✅ 模型加载完毕！")

    def run(self, prompt, width, height, steps):
        import io
        import torch
        
        torch.cuda.empty_cache()
        with torch.inference_mode():
            image = self.pipe(
                prompt=prompt,
                num_inference_steps=steps, 
                guidance_scale=0.0,
                width=width,
                height=height
            ).images[0]

        byte_stream = io.BytesIO()
        image.save(byte_stream, format="JPEG")
        return byte_stream.getvalue()

# ==============================================================================
# 3. 定义两个不同的 GPU 后端
# ==============================================================================

# 后端 A: 通用节点 (NVIDIA A10G)
# 适合跑 1024x1024 及以下的任务。
@app.cls(
    image=image_gpu,
    gpu="A10G",  # <--- 这里指定 A10G
    scaledown_window=300,
    timeout=600,
)
class ModelA10G:
    @modal.enter()
    def setup(self):
        self.engine = InferenceEngine()
        self.engine.load_model()

    @modal.method()
    def generate(self, prompt: str, width: int, height: int, steps: int):
        print(f"⚡ [A10G 通用节点] 处理任务: {width}x{height}")
        return self.engine.run(prompt, width, height, steps)

# 后端 B: 旗舰节点 (NVIDIA A100)
# 适合跑 2k 超大分辨率的任务。
@app.cls(
    image=image_gpu,
    gpu="A100", # <--- 这里指定 A100
    scaledown_window=300,
    timeout=600,
)
class ModelA100:
    @modal.enter()
    def setup(self):
        self.engine = InferenceEngine()
        self.engine.load_model()

    @modal.method()
    def generate(self, prompt: str, width: int, height: int, steps: int):
        print(f"🚀 [A100 旗舰节点] 处理任务: {width}x{height}")
        return self.engine.run(prompt, width, height, steps)

# ==============================================================================
# 4. API 接口 (智能调度器)
# ==============================================================================
@app.function(
    image=modal.Image.debian_slim().pip_install("fastapi[standard]"), 
    scaledown_window=300
)
@modal.fastapi_endpoint(docs=True)
def generate(
    prompt: str = "A cinematic shot of a futuristic city",
    width: int = 1024,
    height: int = 1024,
    steps: int = 4
):
    from fastapi import Response
    
    # 参数修正
    if width > 2048: width = 2048
    if height > 2048: height = 2048
    if width < 256: width = 256
    if height < 256: height = 256
    width = (width // 8) * 8
    height = (height // 8) * 8
    if steps > 20: steps = 20
    if steps < 1: steps = 1
    
    # 🧠 【智能调度逻辑】
    total_pixels = width * height
    threshold = 1024 * 1024 # 100万像素 (即标准 1024x1024)
    
    try:
        if total_pixels <= threshold:
            # 如果图片比较小，派给 A10G
            print(f"🚦 调度: {width}x{height} -> A10G (通用)")
            jpg_bytes = ModelA10G().generate.remote(prompt, width, height, steps)
        else:
            # 如果图片很大 (2k)，派给 A100
            print(f"🚦 调度: {width}x{height} -> A100 (旗舰)")
            jpg_bytes = ModelA100().generate.remote(prompt, width, height, steps)
            
        return Response(
            content=jpg_bytes, 
            media_type="image/jpeg",
            headers={"Access-Control-Allow-Origin": "*"} 
        )
    except Exception as e:
        return Response(content=f"Error: {str(e)}", status_code=500)
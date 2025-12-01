// 从环境变量读取 API 地址，支持以逗号分隔的多个地址
const getApiUrls = () => {
    const urls = import.meta.env.VITE_API_URLS || "";
    return urls.split(',').map(url => url.trim()).filter(url => url);
};

const API_URLS = getApiUrls();

export const generateImage = async (prompt, width, height, steps) => {
    if (API_URLS.length === 0) {
        throw new Error("No API URLs configured");
    }

    let lastError = null;

    // 故障转移策略 (Failover): 优先使用第一个，失败则尝试下一个
    for (const baseUrl of API_URLS) {
        try {
            console.log(`Trying API node: ${baseUrl}`);
            const url = new URL(baseUrl);
            url.searchParams.append("prompt", prompt);
            url.searchParams.append("width", width);
            url.searchParams.append("height", height);
            url.searchParams.append("steps", steps);

            const response = await fetch(url.toString(), {
                method: 'GET',
                headers: {
                    'Accept': 'image/jpeg',
                },
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API Error: ${response.status} - ${errorText}`);
            }

            const blob = await response.blob();
            return URL.createObjectURL(blob);
        } catch (error) {
            console.warn(`Failed to generate image with ${baseUrl}:`, error);
            lastError = error;
            // 继续尝试下一个节点
        }
    }

    console.error("All API nodes failed");
    throw lastError || new Error("All API nodes failed");
};
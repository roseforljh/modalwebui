import React from 'react';
import { Download, Image as ImageIcon } from 'lucide-react';

const Display = ({ imageUrl, loading, error }) => {
  const handleDownload = () => {
    if (imageUrl) {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `generated-image-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="bg-zinc-900/50 p-8 rounded-2xl backdrop-blur-sm border border-white/10 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-3 tracking-wide">
          <ImageIcon size={20} className="text-white/70" />
          生成结果
        </h2>
        {imageUrl && !loading && (
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-white text-black hover:bg-gray-200 text-sm font-bold rounded-lg transition-all shadow-lg active:scale-95"
          >
            <Download size={16} />
            下载图片
          </button>
        )}
      </div>

      <div className="flex-1 flex items-center justify-center bg-black/40 rounded-xl border border-white/10 overflow-hidden min-h-[500px] relative backdrop-blur-md">
        {loading ? (
          <div className="text-center space-y-6 animate-pulse">
            <div className="w-20 h-20 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto opacity-80"></div>
            <p className="text-white/50 text-lg font-light tracking-widest uppercase">正在绘制您的杰作...</p>
          </div>
        ) : error ? (
          <div className="text-center p-8 max-w-md bg-red-500/10 rounded-2xl border border-red-500/20">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h3 className="text-xl font-bold text-red-400 mb-2">生成失败</h3>
            <p className="text-red-200/70 text-sm">{error}</p>
          </div>
        ) : imageUrl ? (
          <img
            src={imageUrl}
            alt="Generated result"
            className="max-w-full max-h-full object-contain shadow-2xl"
          />
        ) : (
          <div className="text-center text-white/20">
            <ImageIcon size={64} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg font-light tracking-wide">输入提示词并点击生成开始</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Display;
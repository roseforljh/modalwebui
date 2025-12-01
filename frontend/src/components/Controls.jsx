import React from 'react';
import { Settings, Image as ImageIcon, Type, Activity } from 'lucide-react';

const PRESET_SIZES = [
  { label: '2K 正方形 (1:1)', width: 2048, height: 2048 },
  { label: '2K 宽屏 (16:9)', width: 2048, height: 1152 },
  { label: '2K 手机壁纸 (9:16)', width: 1152, height: 2048 },
  { label: '2K 横向 (4:3)', width: 2048, height: 1536 },
  { label: 'HD 正方形 (1:1)', width: 1024, height: 1024 },
  { label: 'HD 宽屏 (16:9)', width: 1280, height: 720 },
  { label: 'HD 手机壁纸 (9:16)', width: 720, height: 1280 },
];

const Controls = ({
  prompt, setPrompt,
  width, setWidth,
  height, setHeight,
  steps, setSteps,
  onGenerate,
  loading
}) => {
  const handleSizeChange = (e) => {
    const [w, h] = e.target.value.split('x').map(Number);
    setWidth(w);
    setHeight(h);
  };

  return (
    <div className="bg-zinc-900/50 p-8 rounded-2xl backdrop-blur-sm border border-white/10 h-full flex flex-col gap-8">
      {/* Prompt Input */}
      <div className="space-y-3 flex-1">
        <label className="flex items-center gap-2 text-sm font-medium text-white/70 uppercase tracking-wider">
          <Type size={14} />
          提示词 (Prompt)
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="描述你想生成的画面..."
          className="w-full h-full min-h-[160px] bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:ring-1 focus:ring-white/50 focus:border-white/50 resize-none placeholder-white/20 transition-all text-lg leading-relaxed"
          disabled={loading}
        />
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 gap-8">
        {/* Size Control */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-medium text-white/70 uppercase tracking-wider">
            <ImageIcon size={14} /> 图片尺寸
          </label>
          <div className="relative">
            <select
              value={`${width}x${height}`}
              onChange={handleSizeChange}
              className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white appearance-none focus:ring-1 focus:ring-white/50 focus:border-white/50 transition-all cursor-pointer"
              disabled={loading}
            >
              {PRESET_SIZES.map((size) => (
                <option key={size.label} value={`${size.width}x${size.height}`} className="bg-zinc-900">
                  {size.label}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/50">
              <Settings size={16} />
            </div>
          </div>
        </div>

        {/* Steps Control */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm font-medium text-white/70 uppercase tracking-wider">
            <label className="flex items-center gap-2">
              <Activity size={14} /> 推理步数
            </label>
            <span className="text-white font-mono bg-white/10 px-2 py-0.5 rounded text-xs">{steps}</span>
          </div>
          <input
            type="range"
            min="1"
            max="20"
            step="1"
            value={steps}
            onChange={(e) => setSteps(Number(e.target.value))}
            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white hover:accent-gray-200"
            disabled={loading}
          />
          <p className="text-xs text-white/30">步数越高画质越好，但速度越慢</p>
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={onGenerate}
        disabled={loading || !prompt.trim()}
        className={`w-full py-4 px-6 rounded-xl font-bold text-black text-lg tracking-wide transition-all duration-300 transform
          ${loading || !prompt.trim()
            ? 'bg-white/20 cursor-not-allowed opacity-50'
            : 'bg-white hover:bg-gray-200 hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(255,255,255,0.1)]'
          }`}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-3">
            <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            生成中...
          </span>
        ) : (
          '开始生成'
        )}
      </button>
    </div>
  );
};

export default Controls;
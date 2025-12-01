import React, { useState } from 'react';
import Controls from './components/Controls';
import Display from './components/Display';
import { generateImage } from './services/api';
import { Zap } from 'lucide-react';

function App() {
  const [prompt, setPrompt] = useState("一张未来城市的电影感镜头");
  const [width, setWidth] = useState(2048);
  const [height, setHeight] = useState(2048);
  const [steps, setSteps] = useState(4);
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = await generateImage(prompt, width, height, steps);
      setImageUrl(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12">
      <div className="max-w-[1600px] mx-auto space-y-10">
        {/* Header */}
        <header className="flex items-center justify-between pb-8 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-white text-black rounded-full">
              <Zap size={24} fill="currentColor" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white">
                Z-Image-Turbo
              </h1>
              <p className="text-sm text-white/50 tracking-wide uppercase font-medium">极速 AI 图像生成</p>
            </div>
          </div>
          <div className="hidden md:block text-xs text-white/30 border border-white/10 px-3 py-1 rounded-full">
            v1.0.0
          </div>
        </header>

        {/* Main Content */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Panel - Controls */}
          <div className="lg:col-span-4">
            <Controls
              prompt={prompt}
              setPrompt={setPrompt}
              width={width}
              setWidth={setWidth}
              height={height}
              setHeight={setHeight}
              steps={steps}
              setSteps={setSteps}
              onGenerate={handleGenerate}
              loading={loading}
            />
          </div>

          {/* Right Panel - Display */}
          <div className="lg:col-span-8">
            <Display
              imageUrl={imageUrl}
              loading={loading}
              error={error}
            />
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
import { useState, useCallback } from 'react';
import { FractalCanvas } from './components/FractalCanvas';
import { ControlPanel } from './components/ControlPanel';
import { FRACTAL_INFO } from './types/fractal';
import type { FractalConfig } from './types/fractal';

const DEFAULT_CONFIG: FractalConfig = {
  type: 'mandelbrot',
  maxIterations: 100,
  zoom: 1,
  centerX: -0.5,
  centerY: 0,
  colorScheme: 'nebula',
  juliaC: { real: -0.7, imag: 0.27015 },
  randomSeed: 42,
  smoothColoring: true,
};

export default function App() {
  const [config, setConfig] = useState<FractalConfig>(DEFAULT_CONFIG);
  const [renderTime, setRenderTime] = useState(0);
  const [isPanelOpen, setIsPanelOpen] = useState(true);

  const handleConfigChange = useCallback((updates: Partial<FractalConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleViewChange = useCallback((updates: { zoom?: number; centerX?: number; centerY?: number }) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleReset = useCallback(() => {
    const fractalInfo = FRACTAL_INFO[config.type];
    setConfig((prev) => ({
      ...prev,
      zoom: fractalInfo.defaultZoom,
      centerX: fractalInfo.defaultCenter.x,
      centerY: fractalInfo.defaultCenter.y,
    }));
  }, [config.type]);

  const handleRenderComplete = useCallback((time: number) => {
    setRenderTime(time);
  }, []);

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-void">
      {/* Mobile toggle button */}
      <button
        onClick={() => setIsPanelOpen(!isPanelOpen)}
        className="absolute top-4 left-4 z-50 lg:hidden glass rounded-lg p-2 text-white hover:bg-nebula-900/30 transition-all"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isPanelOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Control Panel */}
      <div
        className={`absolute lg:relative z-40 h-full transition-transform duration-300 ease-out ${
          isPanelOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <ControlPanel
          config={config}
          renderTime={renderTime}
          onConfigChange={handleConfigChange}
          onReset={handleReset}
        />
      </div>

      {/* Backdrop for mobile */}
      {isPanelOpen && (
        <div
          className="absolute inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setIsPanelOpen(false)}
        />
      )}

      {/* Main Canvas Area */}
      <div className="flex-1 relative">
        <FractalCanvas
          config={config}
          onViewChange={handleViewChange}
          onRenderComplete={handleRenderComplete}
        />

        {/* Info overlay */}
        <div className="absolute bottom-4 left-4 glass rounded-lg px-4 py-2 text-xs text-gray-400 hidden lg:block">
          <span className="text-nebula-300">Scroll</span> to zoom &bull;{' '}
          <span className="text-nebula-300">Drag</span> to pan
        </div>

        {/* Coordinates display */}
        <div className="absolute bottom-4 right-4 glass rounded-lg px-4 py-2 text-xs font-mono">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-gray-500">x:</span>{' '}
              <span className="text-cosmic-400">{config.centerX.toFixed(8)}</span>
            </div>
            <div>
              <span className="text-gray-500">y:</span>{' '}
              <span className="text-cosmic-400">{config.centerY.toFixed(8)}</span>
            </div>
            <div>
              <span className="text-gray-500">zoom:</span>{' '}
              <span className="text-nebula-400">
                {config.zoom >= 1e6 ? config.zoom.toExponential(2) : config.zoom.toFixed(2)}x
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

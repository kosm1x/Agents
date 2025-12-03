import { FRACTAL_INFO, COLOR_SCHEMES } from '../types/fractal';
import type { FractalConfig, FractalType } from '../types/fractal';

interface ControlPanelProps {
  config: FractalConfig;
  renderTime: number;
  onConfigChange: (updates: Partial<FractalConfig>) => void;
  onReset: () => void;
}

export function ControlPanel({ config, renderTime, onConfigChange, onReset }: ControlPanelProps) {
  const currentFractal = FRACTAL_INFO[config.type];

  return (
    <div className="w-80 glass-dark flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-nebula-900/50">
        <h1 className="font-display text-2xl font-semibold bg-gradient-to-r from-nebula-400 to-cosmic-400 bg-clip-text text-transparent">
          Fractal Explorer
        </h1>
        <p className="text-xs text-gray-500 mt-1 font-mono">
          Infinite complexity from simple rules
        </p>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Fractal Type */}
        <Section title="Fractal Type">
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(FRACTAL_INFO) as FractalType[]).map((type) => (
              <button
                key={type}
                onClick={() => {
                  const info = FRACTAL_INFO[type];
                  onConfigChange({
                    type,
                    centerX: info.defaultCenter.x,
                    centerY: info.defaultCenter.y,
                    zoom: info.defaultZoom,
                  });
                }}
                className={`px-3 py-2 text-xs rounded-lg transition-all btn-glow ${
                  config.type === type
                    ? 'bg-gradient-to-r from-nebula-600 to-cosmic-600 text-white shadow-lg shadow-nebula-500/20'
                    : 'bg-abyss hover:bg-nebula-900/30 text-gray-400 hover:text-white border border-nebula-900/30'
                }`}
              >
                {FRACTAL_INFO[type].name.split(' ')[0]}
              </button>
            ))}
          </div>

          {/* Fractal Info */}
          <div className="mt-4 p-3 rounded-lg bg-abyss/50 border border-nebula-900/20">
            <div className="text-sm font-medium text-nebula-300">{currentFractal.name}</div>
            <div className="text-xs text-gray-500 mt-1">{currentFractal.description}</div>
            <div className="mt-2 px-2 py-1 bg-void/50 rounded text-xs font-mono text-cosmic-400">
              {currentFractal.formula}
            </div>
          </div>
        </Section>

        {/* Iterations */}
        <Section title="Iterations">
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="10"
              max="1000"
              value={config.maxIterations}
              onChange={(e) => onConfigChange({ maxIterations: Number(e.target.value) })}
              className="flex-1"
            />
            <span className="text-sm font-mono text-nebula-300 w-12 text-right">
              {config.maxIterations}
            </span>
          </div>
          <div className="flex gap-2 mt-2">
            {[50, 100, 250, 500].map((val) => (
              <button
                key={val}
                onClick={() => onConfigChange({ maxIterations: val })}
                className={`flex-1 px-2 py-1 text-xs rounded transition-all ${
                  config.maxIterations === val
                    ? 'bg-nebula-700 text-white'
                    : 'bg-abyss hover:bg-nebula-900/30 text-gray-500'
                }`}
              >
                {val}
              </button>
            ))}
          </div>
        </Section>

        {/* Zoom & Position */}
        <Section title="Navigation">
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Zoom Level</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onConfigChange({ zoom: config.zoom * 0.5 })}
                  className="w-8 h-8 flex items-center justify-center rounded bg-abyss hover:bg-nebula-900/30 text-gray-400 hover:text-white transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                <div className="flex-1 text-center text-sm font-mono text-nebula-300">
                  {config.zoom >= 1e6 ? config.zoom.toExponential(2) : config.zoom.toFixed(2)}x
                </div>
                <button
                  onClick={() => onConfigChange({ zoom: config.zoom * 2 })}
                  className="w-8 h-8 flex items-center justify-center rounded bg-abyss hover:bg-nebula-900/30 text-gray-400 hover:text-white transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Center X</label>
                <div className="text-xs font-mono text-cosmic-400 bg-abyss/50 px-2 py-1 rounded truncate">
                  {config.centerX.toFixed(6)}
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Center Y</label>
                <div className="text-xs font-mono text-cosmic-400 bg-abyss/50 px-2 py-1 rounded truncate">
                  {config.centerY.toFixed(6)}
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* Julia Set Parameters (only shown for Julia) */}
        {config.type === 'julia' && (
          <Section title="Julia Constant">
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Real Part (c_r)</label>
                <input
                  type="range"
                  min="-2"
                  max="2"
                  step="0.01"
                  value={config.juliaC.real}
                  onChange={(e) => onConfigChange({ juliaC: { ...config.juliaC, real: Number(e.target.value) } })}
                  className="w-full"
                />
                <div className="text-xs font-mono text-cosmic-400 text-right">
                  {config.juliaC.real.toFixed(3)}
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Imaginary Part (c_i)</label>
                <input
                  type="range"
                  min="-2"
                  max="2"
                  step="0.01"
                  value={config.juliaC.imag}
                  onChange={(e) => onConfigChange({ juliaC: { ...config.juliaC, imag: Number(e.target.value) } })}
                  className="w-full"
                />
                <div className="text-xs font-mono text-cosmic-400 text-right">
                  {config.juliaC.imag.toFixed(3)}i
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {[
                  { label: 'Classic', r: -0.7, i: 0.27015 },
                  { label: 'Spiral', r: -0.8, i: 0.156 },
                  { label: 'Dragon', r: -0.4, i: 0.6 },
                  { label: 'Rabbit', r: -0.123, i: 0.745 },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => onConfigChange({ juliaC: { real: preset.r, imag: preset.i } })}
                    className="px-2 py-1 text-xs rounded bg-abyss hover:bg-nebula-900/30 text-gray-500 hover:text-white transition-all"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </Section>
        )}

        {/* Randomness (for applicable fractals) */}
        {currentFractal.hasRandomness && (
          <Section title="Variation Seed">
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="100"
                value={config.randomSeed}
                onChange={(e) => onConfigChange({ randomSeed: Number(e.target.value) })}
                className="flex-1"
              />
              <span className="text-sm font-mono text-nebula-300 w-8 text-right">
                {config.randomSeed}
              </span>
            </div>
            <button
              onClick={() => onConfigChange({ randomSeed: Math.floor(Math.random() * 100) })}
              className="mt-2 w-full px-3 py-2 text-xs rounded-lg bg-abyss hover:bg-nebula-900/30 text-gray-400 hover:text-white transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Randomize
            </button>
          </Section>
        )}

        {/* Color Scheme */}
        <Section title="Color Palette">
          <div className="grid grid-cols-2 gap-2">
            {COLOR_SCHEMES.map((scheme) => (
              <button
                key={scheme.id}
                onClick={() => onConfigChange({ colorScheme: scheme.id })}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                  config.colorScheme === scheme.id
                    ? 'bg-nebula-900/50 ring-1 ring-nebula-500'
                    : 'bg-abyss hover:bg-nebula-900/30'
                }`}
              >
                <div className="flex -space-x-1">
                  {scheme.preview.map((color, i) => (
                    <div
                      key={i}
                      className="w-3 h-3 rounded-full border border-void"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-400">{scheme.name}</span>
              </button>
            ))}
          </div>
        </Section>

        {/* Rendering Options */}
        <Section title="Rendering">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                checked={config.smoothColoring}
                onChange={(e) => onConfigChange({ smoothColoring: e.target.checked })}
                className="sr-only"
              />
              <div className={`w-10 h-5 rounded-full transition-all ${config.smoothColoring ? 'bg-nebula-600' : 'bg-abyss'}`}>
                <div className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-all ${config.smoothColoring ? 'translate-x-5' : 'translate-x-0.5'} translate-y-0.5`} />
              </div>
            </div>
            <span className="text-sm text-gray-400 group-hover:text-white transition-colors">
              Smooth coloring
            </span>
          </label>
        </Section>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-nebula-900/50 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">Render time</span>
          <span className="font-mono text-cosmic-400">{renderTime.toFixed(1)}ms</span>
        </div>
        <button
          onClick={onReset}
          className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-nebula-700 to-cosmic-700 hover:from-nebula-600 hover:to-cosmic-600 text-white text-sm font-medium transition-all shadow-lg shadow-nebula-500/20 btn-glow"
        >
          Reset View
        </button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
        {title}
      </h3>
      {children}
    </div>
  );
}

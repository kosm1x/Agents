export type FractalType = 
  | 'mandelbrot' 
  | 'julia' 
  | 'burningShip' 
  | 'tricorn'
  | 'newton'
  | 'phoenix';

export interface FractalConfig {
  type: FractalType;
  maxIterations: number;
  zoom: number;
  centerX: number;
  centerY: number;
  colorScheme: ColorScheme;
  juliaC: { real: number; imag: number };
  randomSeed: number;
  smoothColoring: boolean;
}

export type ColorScheme = 
  | 'nebula'
  | 'ocean'
  | 'fire'
  | 'monochrome'
  | 'rainbow'
  | 'twilight'
  | 'aurora'
  | 'psychedelic';

export interface ViewState {
  zoom: number;
  centerX: number;
  centerY: number;
}

export interface RenderResult {
  imageData: ImageData;
  renderTime: number;
}

export interface FractalInfo {
  id: FractalType;
  name: string;
  description: string;
  formula: string;
  defaultCenter: { x: number; y: number };
  defaultZoom: number;
  hasRandomness: boolean;
}

export const FRACTAL_INFO: Record<FractalType, FractalInfo> = {
  mandelbrot: {
    id: 'mandelbrot',
    name: 'Mandelbrot Set',
    description: 'The iconic fractal, boundary of the set of complex numbers for which z² + c does not diverge.',
    formula: 'z_{n+1} = z_n² + c',
    defaultCenter: { x: -0.5, y: 0 },
    defaultZoom: 1,
    hasRandomness: false,
  },
  julia: {
    id: 'julia',
    name: 'Julia Set',
    description: 'Related to Mandelbrot but uses a fixed complex constant. Each point in the Mandelbrot set corresponds to a Julia set.',
    formula: 'z_{n+1} = z_n² + c (fixed)',
    defaultCenter: { x: 0, y: 0 },
    defaultZoom: 1,
    hasRandomness: true,
  },
  burningShip: {
    id: 'burningShip',
    name: 'Burning Ship',
    description: 'A variant using absolute values, creating distinctive ship-like shapes.',
    formula: 'z_{n+1} = (|Re(z_n)| + i|Im(z_n)|)² + c',
    defaultCenter: { x: -0.4, y: -0.6 },
    defaultZoom: 1,
    hasRandomness: false,
  },
  tricorn: {
    id: 'tricorn',
    name: 'Tricorn (Mandelbar)',
    description: 'Uses the complex conjugate, creating three-fold symmetry.',
    formula: 'z_{n+1} = z̄_n² + c',
    defaultCenter: { x: -0.3, y: 0 },
    defaultZoom: 1,
    hasRandomness: false,
  },
  newton: {
    id: 'newton',
    name: 'Newton Fractal',
    description: "Based on Newton's method for finding roots of polynomials.",
    formula: 'z_{n+1} = z_n - f(z_n)/f\'(z_n)',
    defaultCenter: { x: 0, y: 0 },
    defaultZoom: 0.5,
    hasRandomness: true,
  },
  phoenix: {
    id: 'phoenix',
    name: 'Phoenix Fractal',
    description: 'A variant that uses two previous iterations, creating flame-like patterns.',
    formula: 'z_{n+1} = z_n² + c + p·z_{n-1}',
    defaultCenter: { x: 0, y: 0 },
    defaultZoom: 1.2,
    hasRandomness: true,
  },
};

export const COLOR_SCHEMES: { id: ColorScheme; name: string; preview: string[] }[] = [
  { id: 'nebula', name: 'Nebula', preview: ['#0a0a0f', '#3a0086', '#822eff', '#d4b8ff'] },
  { id: 'ocean', name: 'Ocean Depths', preview: ['#001a33', '#004080', '#0099cc', '#66d9ff'] },
  { id: 'fire', name: 'Inferno', preview: ['#1a0000', '#800000', '#ff4500', '#ffd700'] },
  { id: 'monochrome', name: 'Noir', preview: ['#000000', '#333333', '#888888', '#ffffff'] },
  { id: 'rainbow', name: 'Spectrum', preview: ['#ff0000', '#00ff00', '#0000ff', '#ffff00'] },
  { id: 'twilight', name: 'Twilight', preview: ['#0d1b2a', '#1b263b', '#415a77', '#e0e1dd'] },
  { id: 'aurora', name: 'Aurora', preview: ['#000428', '#004e92', '#00bf72', '#a8ff78'] },
  { id: 'psychedelic', name: 'Psychedelic', preview: ['#ff00ff', '#00ffff', '#ff6600', '#00ff00'] },
];

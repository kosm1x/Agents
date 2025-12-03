import type { FractalType, ColorScheme } from '../types/fractal';

// Seeded random number generator for reproducible randomness
export function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}

// Complex number operations
interface Complex {
  re: number;
  im: number;
}

const complexMul = (a: Complex, b: Complex): Complex => ({
  re: a.re * b.re - a.im * b.im,
  im: a.re * b.im + a.im * b.re,
});

const complexDiv = (a: Complex, b: Complex): Complex => {
  const denom = b.re * b.re + b.im * b.im;
  return {
    re: (a.re * b.re + a.im * b.im) / denom,
    im: (a.im * b.re - a.re * b.im) / denom,
  };
};

const complexAbs2 = (z: Complex): number => z.re * z.re + z.im * z.im;
const complexAbs = (z: Complex): number => Math.sqrt(complexAbs2(z));

// Fractal iteration functions
export function mandelbrotIteration(
  x: number,
  y: number,
  maxIterations: number
): { iterations: number; smooth: number } {
  let zRe = 0;
  let zIm = 0;
  let iteration = 0;
  const bailout = 4;

  while (zRe * zRe + zIm * zIm < bailout && iteration < maxIterations) {
    const temp = zRe * zRe - zIm * zIm + x;
    zIm = 2 * zRe * zIm + y;
    zRe = temp;
    iteration++;
  }

  // Smooth coloring using escape time algorithm
  let smooth = iteration;
  if (iteration < maxIterations) {
    const log_zn = Math.log(zRe * zRe + zIm * zIm) / 2;
    const nu = Math.log(log_zn / Math.log(2)) / Math.log(2);
    smooth = iteration + 1 - nu;
  }

  return { iterations: iteration, smooth };
}

export function juliaIteration(
  x: number,
  y: number,
  cRe: number,
  cIm: number,
  maxIterations: number
): { iterations: number; smooth: number } {
  let zRe = x;
  let zIm = y;
  let iteration = 0;
  const bailout = 4;

  while (zRe * zRe + zIm * zIm < bailout && iteration < maxIterations) {
    const temp = zRe * zRe - zIm * zIm + cRe;
    zIm = 2 * zRe * zIm + cIm;
    zRe = temp;
    iteration++;
  }

  let smooth = iteration;
  if (iteration < maxIterations) {
    const log_zn = Math.log(zRe * zRe + zIm * zIm) / 2;
    const nu = Math.log(log_zn / Math.log(2)) / Math.log(2);
    smooth = iteration + 1 - nu;
  }

  return { iterations: iteration, smooth };
}

export function burningShipIteration(
  x: number,
  y: number,
  maxIterations: number
): { iterations: number; smooth: number } {
  let zRe = 0;
  let zIm = 0;
  let iteration = 0;
  const bailout = 4;

  while (zRe * zRe + zIm * zIm < bailout && iteration < maxIterations) {
    const temp = zRe * zRe - zIm * zIm + x;
    zIm = Math.abs(2 * zRe * zIm) + y;
    zRe = temp;
    zRe = Math.abs(zRe);
    iteration++;
  }

  let smooth = iteration;
  if (iteration < maxIterations) {
    const log_zn = Math.log(zRe * zRe + zIm * zIm) / 2;
    const nu = Math.log(log_zn / Math.log(2)) / Math.log(2);
    smooth = iteration + 1 - nu;
  }

  return { iterations: iteration, smooth };
}

export function tricornIteration(
  x: number,
  y: number,
  maxIterations: number
): { iterations: number; smooth: number } {
  let zRe = 0;
  let zIm = 0;
  let iteration = 0;
  const bailout = 4;

  while (zRe * zRe + zIm * zIm < bailout && iteration < maxIterations) {
    // Using conjugate: z_bar squared
    const temp = zRe * zRe - zIm * zIm + x;
    zIm = -2 * zRe * zIm + y;
    zRe = temp;
    iteration++;
  }

  let smooth = iteration;
  if (iteration < maxIterations) {
    const log_zn = Math.log(zRe * zRe + zIm * zIm) / 2;
    const nu = Math.log(log_zn / Math.log(2)) / Math.log(2);
    smooth = iteration + 1 - nu;
  }

  return { iterations: iteration, smooth };
}

export function newtonIteration(
  x: number,
  y: number,
  maxIterations: number,
  seed: number
): { iterations: number; root: number } {
  // Newton fractal for z^3 - 1 = 0
  // Roots are at: 1, e^(2πi/3), e^(4πi/3)
  const rng = seededRandom(seed);
  const power = 3 + Math.floor(rng() * 3); // Power between 3-5 based on seed
  
  let z: Complex = { re: x, im: y };
  const tolerance = 1e-6;
  let iteration = 0;

  // Roots of z^power - 1 = 0
  const roots: Complex[] = [];
  for (let i = 0; i < power; i++) {
    const angle = (2 * Math.PI * i) / power;
    roots.push({ re: Math.cos(angle), im: Math.sin(angle) });
  }

  while (iteration < maxIterations) {
    // Check convergence to any root
    for (let r = 0; r < roots.length; r++) {
      const dist = complexAbs({ re: z.re - roots[r].re, im: z.im - roots[r].im });
      if (dist < tolerance) {
        return { iterations: iteration, root: r };
      }
    }

    // Newton iteration: z = z - f(z)/f'(z)
    // For z^n - 1: f(z) = z^n - 1, f'(z) = n*z^(n-1)
    // z_new = z - (z^n - 1)/(n*z^(n-1)) = z - z/n + 1/(n*z^(n-1))
    //       = ((n-1)*z + z^(1-n))/n
    
    // Calculate z^(power-1)
    let zPow: Complex = { re: 1, im: 0 };
    for (let i = 0; i < power - 1; i++) {
      zPow = complexMul(zPow, z);
    }
    
    // z^power = z^(power-1) * z
    const zPowerFull = complexMul(zPow, z);
    
    // f(z) = z^power - 1
    const f: Complex = { re: zPowerFull.re - 1, im: zPowerFull.im };
    
    // f'(z) = power * z^(power-1)
    const fPrime: Complex = { re: power * zPow.re, im: power * zPow.im };
    
    // Avoid division by zero
    if (complexAbs2(fPrime) < 1e-12) break;
    
    // Newton step: z = z - f/f'
    const step = complexDiv(f, fPrime);
    z = { re: z.re - step.re, im: z.im - step.im };
    
    iteration++;
  }

  // Didn't converge - find closest root
  let minDist = Infinity;
  let closestRoot = 0;
  for (let r = 0; r < roots.length; r++) {
    const dist = complexAbs({ re: z.re - roots[r].re, im: z.im - roots[r].im });
    if (dist < minDist) {
      minDist = dist;
      closestRoot = r;
    }
  }

  return { iterations: iteration, root: closestRoot };
}

export function phoenixIteration(
  x: number,
  y: number,
  pRe: number,
  pIm: number,
  maxIterations: number
): { iterations: number; smooth: number } {
  // Phoenix fractal: z_{n+1} = z_n^2 + c + p * z_{n-1}
  let zRe = x;
  let zIm = y;
  let zPrevRe = 0;
  let zPrevIm = 0;
  let iteration = 0;
  const bailout = 4;
  const c = { re: 0.5667, im: 0 }; // Classic phoenix constant

  while (zRe * zRe + zIm * zIm < bailout && iteration < maxIterations) {
    const temp = zRe * zRe - zIm * zIm + c.re + pRe * zPrevRe - pIm * zPrevIm;
    const tempIm = 2 * zRe * zIm + c.im + pRe * zPrevIm + pIm * zPrevRe;
    
    zPrevRe = zRe;
    zPrevIm = zIm;
    zRe = temp;
    zIm = tempIm;
    iteration++;
  }

  let smooth = iteration;
  if (iteration < maxIterations) {
    const log_zn = Math.log(zRe * zRe + zIm * zIm) / 2;
    const nu = Math.log(log_zn / Math.log(2)) / Math.log(2);
    smooth = iteration + 1 - nu;
  }

  return { iterations: iteration, smooth };
}

// Color palette generators
export function getColor(
  value: number,
  maxIterations: number,
  scheme: ColorScheme,
  isInSet: boolean,
  rootIndex?: number
): [number, number, number] {
  if (isInSet) {
    return [0, 0, 0];
  }

  const t = value / maxIterations;

  switch (scheme) {
    case 'nebula':
      return nebulaColor(t);
    case 'ocean':
      return oceanColor(t);
    case 'fire':
      return fireColor(t);
    case 'monochrome':
      return monochromeColor(t);
    case 'rainbow':
      return rainbowColor(t, rootIndex);
    case 'twilight':
      return twilightColor(t);
    case 'aurora':
      return auroraColor(t);
    case 'psychedelic':
      return psychedelicColor(t, rootIndex);
    default:
      return nebulaColor(t);
  }
}

function nebulaColor(t: number): [number, number, number] {
  // Purple to cyan gradient with deep space blacks
  const r = Math.floor(255 * (0.5 + 0.5 * Math.cos(2 * Math.PI * (t + 0.0))));
  const g = Math.floor(255 * (0.3 + 0.2 * Math.cos(2 * Math.PI * (t + 0.15))));
  const b = Math.floor(255 * (0.7 + 0.3 * Math.cos(2 * Math.PI * (t + 0.3))));
  return [
    Math.max(0, Math.min(255, r)),
    Math.max(0, Math.min(255, g)),
    Math.max(0, Math.min(255, b)),
  ];
}

function oceanColor(t: number): [number, number, number] {
  const r = Math.floor(255 * (0.0 + 0.2 * t));
  const g = Math.floor(255 * (0.2 + 0.5 * t));
  const b = Math.floor(255 * (0.4 + 0.6 * t));
  return [r, g, b];
}

function fireColor(t: number): [number, number, number] {
  const r = Math.floor(255 * Math.min(1, t * 3));
  const g = Math.floor(255 * Math.max(0, Math.min(1, (t - 0.33) * 3)));
  const b = Math.floor(255 * Math.max(0, Math.min(1, (t - 0.67) * 3)));
  return [r, g, b];
}

function monochromeColor(t: number): [number, number, number] {
  const v = Math.floor(255 * Math.pow(t, 0.5));
  return [v, v, v];
}

function rainbowColor(t: number, rootIndex?: number): [number, number, number] {
  const hue = rootIndex !== undefined ? (rootIndex / 3 + t * 0.3) % 1 : t;
  return hslToRgb(hue, 0.9, 0.5);
}

function twilightColor(t: number): [number, number, number] {
  // Deep blue to warm orange
  const r = Math.floor(255 * (0.05 + 0.85 * Math.pow(t, 1.5)));
  const g = Math.floor(255 * (0.1 + 0.4 * t));
  const b = Math.floor(255 * (0.15 + 0.35 * (1 - t)));
  return [r, g, b];
}

function auroraColor(t: number): [number, number, number] {
  // Northern lights: cyan, green, purple
  const phase = t * 3;
  if (phase < 1) {
    return [
      Math.floor(255 * 0.1),
      Math.floor(255 * (0.3 + 0.5 * phase)),
      Math.floor(255 * (0.5 + 0.3 * phase)),
    ];
  } else if (phase < 2) {
    const p = phase - 1;
    return [
      Math.floor(255 * (0.1 + 0.2 * p)),
      Math.floor(255 * (0.8 - 0.2 * p)),
      Math.floor(255 * (0.8 - 0.5 * p)),
    ];
  } else {
    const p = phase - 2;
    return [
      Math.floor(255 * (0.3 + 0.5 * p)),
      Math.floor(255 * (0.6 + 0.3 * p)),
      Math.floor(255 * (0.3 + 0.3 * p)),
    ];
  }
}

function psychedelicColor(t: number, rootIndex?: number): [number, number, number] {
  const offset = rootIndex !== undefined ? rootIndex * 0.33 : 0;
  const r = Math.floor(255 * (0.5 + 0.5 * Math.sin(2 * Math.PI * (t * 5 + offset))));
  const g = Math.floor(255 * (0.5 + 0.5 * Math.sin(2 * Math.PI * (t * 5 + offset + 0.33))));
  const b = Math.floor(255 * (0.5 + 0.5 * Math.sin(2 * Math.PI * (t * 5 + offset + 0.67))));
  return [r, g, b];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

// Main rendering function
export function renderFractal(
  canvas: HTMLCanvasElement,
  config: {
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
): number {
  const ctx = canvas.getContext('2d');
  if (!ctx) return 0;

  const startTime = performance.now();
  const width = canvas.width;
  const height = canvas.height;
  const imageData = ctx.createImageData(width, height);
  const data = imageData.data;

  const aspectRatio = width / height;
  const rangeX = 3.5 / config.zoom;
  const rangeY = rangeX / aspectRatio;

  const xMin = config.centerX - rangeX / 2;
  const yMin = config.centerY - rangeY / 2;
  const xStep = rangeX / width;
  const yStep = rangeY / height;

  for (let py = 0; py < height; py++) {
    for (let px = 0; px < width; px++) {
      const x = xMin + px * xStep;
      const y = yMin + py * yStep;

      let result: { iterations?: number; smooth?: number; root?: number };
      
      switch (config.type) {
        case 'mandelbrot':
          result = mandelbrotIteration(x, y, config.maxIterations);
          break;
        case 'julia':
          result = juliaIteration(x, y, config.juliaC.real, config.juliaC.imag, config.maxIterations);
          break;
        case 'burningShip':
          result = burningShipIteration(x, y, config.maxIterations);
          break;
        case 'tricorn':
          result = tricornIteration(x, y, config.maxIterations);
          break;
        case 'newton':
          result = newtonIteration(x, y, config.maxIterations, config.randomSeed);
          break;
        case 'phoenix': {
          const pRe = -0.5 + 0.5 * Math.sin(config.randomSeed);
          const pIm = 0.1 * Math.cos(config.randomSeed * 2);
          result = phoenixIteration(x, y, pRe, pIm, config.maxIterations);
          break;
        }
        default:
          result = mandelbrotIteration(x, y, config.maxIterations);
      }

      const iterations = result.iterations ?? 0;
      const smooth = result.smooth ?? iterations;
      const isInSet = iterations >= config.maxIterations;
      const colorValue = config.smoothColoring ? smooth : iterations;

      const [r, g, b] = getColor(
        colorValue,
        config.maxIterations,
        config.colorScheme,
        isInSet,
        result.root
      );

      const idx = (py * width + px) * 4;
      data[idx] = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return performance.now() - startTime;
}

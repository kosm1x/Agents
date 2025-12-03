# Fractal Explorer

An interactive visualization of fractals with real-time rendering, zoom, pan, and customizable parameters.

## Features

- **6 Fractal Types**:
  - **Mandelbrot Set** - The iconic fractal, boundary of complex numbers for which z² + c does not diverge
  - **Julia Set** - Related to Mandelbrot, uses fixed complex constant with adjustable parameters
  - **Burning Ship** - Variant using absolute values, creating distinctive ship-like shapes
  - **Tricorn (Mandelbar)** - Uses complex conjugate, creating three-fold symmetry
  - **Newton Fractal** - Based on Newton's method for finding polynomial roots
  - **Phoenix Fractal** - Uses two previous iterations, creating flame-like patterns

- **Interactive Controls**:
  - Mouse wheel zoom (zooms towards cursor position)
  - Click and drag to pan
  - Touch support with pinch-to-zoom
  - Configurable iteration count (10-1000)
  - Smooth coloring toggle

- **8 Color Palettes**:
  - Nebula, Ocean, Fire, Monochrome, Rainbow, Twilight, Aurora, Psychedelic

- **Julia Set Controls**:
  - Adjustable real and imaginary parts of the constant
  - Preset configurations (Classic, Spiral, Dragon, Rabbit)

- **Randomness/Variation**:
  - Seed-based variation for Newton and Phoenix fractals
  - Randomize button for exploration

## Tech Stack

- **React 19** with TypeScript
- **Vite** for fast development and optimized builds
- **TailwindCSS** for styling
- **Web Workers** for non-blocking fractal computation
- **HTML Canvas** for high-performance rendering

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Usage

1. **Select a fractal type** from the grid of buttons
2. **Adjust iterations** using the slider (higher = more detail but slower)
3. **Zoom** using mouse wheel or +/- buttons
4. **Pan** by clicking and dragging
5. **Choose a color palette** to change the visualization
6. **For Julia sets**, adjust the constant parameters or use presets
7. **For Newton/Phoenix**, use the randomness slider or randomize button

## Performance Notes

- Rendering is performed in a Web Worker to keep the UI responsive
- Canvas resolution is capped at 2x device pixel ratio for performance
- Render times are displayed in the footer

## License

MIT

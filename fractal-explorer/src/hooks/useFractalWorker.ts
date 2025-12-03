import { useRef, useCallback, useEffect } from 'react';
import type { FractalConfig } from '../types/fractal';

export function useFractalWorker() {
  const workerRef = useRef<Worker | null>(null);
  const callbackRef = useRef<((result: { imageData: Uint8ClampedArray; width: number; height: number; renderTime: number }) => void) | null>(null);

  useEffect(() => {
    workerRef.current = new Worker(
      new URL('../workers/fractalWorker.ts', import.meta.url),
      { type: 'module' }
    );

    workerRef.current.onmessage = (e) => {
      if (callbackRef.current) {
        callbackRef.current(e.data);
      }
    };

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const render = useCallback((
    width: number,
    height: number,
    config: FractalConfig,
    callback: (result: { imageData: Uint8ClampedArray; width: number; height: number; renderTime: number }) => void
  ) => {
    callbackRef.current = callback;
    workerRef.current?.postMessage({
      type: 'render',
      width,
      height,
      config,
    });
  }, []);

  return { render };
}

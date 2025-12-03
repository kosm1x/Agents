import { useRef, useEffect, useState, useCallback } from 'react';
import type { FractalConfig } from '../types/fractal';
import { useFractalWorker } from '../hooks/useFractalWorker';

interface FractalCanvasProps {
  config: FractalConfig;
  onViewChange: (updates: { zoom?: number; centerX?: number; centerY?: number }) => void;
  onRenderComplete: (time: number) => void;
}

export function FractalCanvas({ config, onViewChange, onRenderComplete }: FractalCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { render } = useFractalWorker();
  const [isRendering, setIsRendering] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, centerX: 0, centerY: 0 });
  const renderTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingConfigRef = useRef<FractalConfig | null>(null);

  // Resize canvas to fit container
  useEffect(() => {
    const resizeCanvas = () => {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (!container || !canvas) return;

      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap at 2x for performance
      
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  // Render fractal
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Debounce renders
    if (renderTimeoutRef.current) {
      pendingConfigRef.current = config;
      return;
    }

    // Show loading state - this is intentional for UX
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsRendering(true);
    
    render(canvas.width, canvas.height, config, (result) => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const imageData = ctx.createImageData(result.width, result.height);
      imageData.data.set(result.imageData);
      ctx.putImageData(imageData, 0, 0);
      
      setIsRendering(false);
      onRenderComplete(result.renderTime);

      // Check for pending render
      if (pendingConfigRef.current) {
        const pendingConfig = pendingConfigRef.current;
        pendingConfigRef.current = null;
        renderTimeoutRef.current = setTimeout(() => {
          renderTimeoutRef.current = null;
          setIsRendering(true);
          render(canvas.width, canvas.height, pendingConfig, (newResult) => {
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            const newImageData = ctx.createImageData(newResult.width, newResult.height);
            newImageData.data.set(newResult.imageData);
            ctx.putImageData(newImageData, 0, 0);
            setIsRendering(false);
            onRenderComplete(newResult.renderTime);
          });
        }, 16);
      }
    });

    return () => {
      if (renderTimeoutRef.current) {
        clearTimeout(renderTimeoutRef.current);
      }
    };
  }, [config, render, onRenderComplete]);

  // Mouse wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) / rect.width;
    const mouseY = (e.clientY - rect.top) / rect.height;

    const zoomFactor = e.deltaY > 0 ? 0.8 : 1.25;
    const newZoom = config.zoom * zoomFactor;

    // Calculate new center to zoom towards mouse position
    const aspectRatio = canvas.width / canvas.height;
    const rangeX = 3.5 / config.zoom;
    const rangeY = rangeX / aspectRatio;

    const xMin = config.centerX - rangeX / 2;
    const yMin = config.centerY - rangeY / 2;

    const mouseWorldX = xMin + mouseX * rangeX;
    const mouseWorldY = yMin + mouseY * rangeY;

    const newRangeX = 3.5 / newZoom;
    const newRangeY = newRangeX / aspectRatio;

    const newCenterX = mouseWorldX - (mouseX - 0.5) * newRangeX;
    const newCenterY = mouseWorldY - (mouseY - 0.5) * newRangeY;

    onViewChange({
      zoom: Math.max(0.1, Math.min(1e15, newZoom)),
      centerX: newCenterX,
      centerY: newCenterY,
    });
  }, [config, onViewChange]);

  // Mouse drag pan
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      centerX: config.centerX,
      centerY: config.centerY,
    };
  }, [config.centerX, config.centerY]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;

    const aspectRatio = canvas.width / canvas.height;
    const rangeX = 3.5 / config.zoom;
    const rangeY = rangeX / aspectRatio;

    const centerX = dragStartRef.current.centerX - (dx / rect.width) * rangeX;
    const centerY = dragStartRef.current.centerY - (dy / rect.height) * rangeY;

    onViewChange({ centerX, centerY });
  }, [isDragging, config.zoom, onViewChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Touch support
  const touchStartRef = useRef({ x: 0, y: 0, centerX: 0, centerY: 0, distance: 0, zoom: 1 });

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        centerX: config.centerX,
        centerY: config.centerY,
        distance: 0,
        zoom: config.zoom,
      };
      setIsDragging(true);
    } else if (e.touches.length === 2) {
      const dx = e.touches[1].clientX - e.touches[0].clientX;
      const dy = e.touches[1].clientY - e.touches[0].clientY;
      touchStartRef.current.distance = Math.sqrt(dx * dx + dy * dy);
      touchStartRef.current.zoom = config.zoom;
    }
  }, [config.centerX, config.centerY, config.zoom]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (e.touches.length === 1 && isDragging) {
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      const dx = touch.clientX - touchStartRef.current.x;
      const dy = touch.clientY - touchStartRef.current.y;

      const aspectRatio = canvas.width / canvas.height;
      const rangeX = 3.5 / config.zoom;
      const rangeY = rangeX / aspectRatio;

      const centerX = touchStartRef.current.centerX - (dx / rect.width) * rangeX;
      const centerY = touchStartRef.current.centerY - (dy / rect.height) * rangeY;

      onViewChange({ centerX, centerY });
    } else if (e.touches.length === 2) {
      const dx = e.touches[1].clientX - e.touches[0].clientX;
      const dy = e.touches[1].clientY - e.touches[0].clientY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const scale = distance / touchStartRef.current.distance;
      const newZoom = touchStartRef.current.zoom * scale;

      onViewChange({ zoom: Math.max(0.1, Math.min(1e15, newZoom)) });
    }
  }, [isDragging, config.zoom, onViewChange]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-void"
    >
      <canvas
        ref={canvasRef}
        className={`block w-full h-full ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />
      
      {/* Loading overlay */}
      {isRendering && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="absolute top-4 right-4 flex items-center gap-2 glass rounded-full px-4 py-2">
            <div className="w-2 h-2 bg-nebula-500 rounded-full loading-fractal" />
            <span className="text-xs text-nebula-200">Rendering...</span>
          </div>
        </div>
      )}
    </div>
  );
}

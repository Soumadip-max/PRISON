'use client';

import React, { useEffect, useRef } from 'react';

const DEFAULT_PARAMS = {
  renderMode: 'stars',
  bgMode: 'solid',
  bgBlur: 12,
  bgOpacity: 90,
  cellSize: 16,
  coverage: 100,
  invert: false,
  brightness: 12,
  contrast: 115,
  edgeEmphasis: 0,
  density: 0,
  tint: '#3ca6ff',
  tintOpacity: 0,
  saturation: 100,
  grayscale: 0,
  pfx: {
    vignette: { enabled: true, intensity: 38 },
    scanLines: { enabled: true, intensity: 40 },
    chromatic: { enabled: false, intensity: 15 },
    bloom: { enabled: true, intensity: 25 },
    filmGrain: { enabled: true, intensity: 30 },
    halftone: { enabled: true, intensity: 20 },
    pixelate: { enabled: true, intensity: 15 }
  },
  animated: true,
  animStyle: 'wave',
  animSpeed: { enabled: true, intensity: 100 },
  animIntensity: { enabled: true, intensity: 60 },
  gradientSource: {
    mode: 'radial',
    colors: [
      { id: 'c1', hex: '#E9CCFF', pos: 0 },
      { id: 'c2', hex: '#8A2BE2', pos: 33 },
      { id: 'c3', hex: '#240046', pos: 67 },
      { id: 'c4', hex: '#03000A', pos: 100 }
    ],
    angle: 90,
    centerX: 46,
    centerY: 52,
    scale: 88,
    softness: 26,
    wave: 12,
    distortion: 28,
    animated: true,
    speed: 50,
    motionAmount: 86,
    seed: 1,
    backdrop: '#EAF4FC'
  }
};

export default function AsciiArtCanvas({ config = DEFAULT_PARAMS, className = '' }) {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let startTime = performance.now();

    // Offscreen canvas for gradient sampling
    const offscreen = document.createElement('canvas');
    const offCtx = offscreen.getContext('2d');

    const handleResize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(100, Math.floor(rect.width || 400));
      const height = Math.max(100, Math.floor(rect.height || 360));

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      offscreen.width = Math.max(1, Math.floor(width / 2));
      offscreen.height = Math.max(1, Math.floor(height / 2));
    };

    handleResize();
    const resizeObserver = new ResizeObserver(() => handleResize());
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    // Helper: Draw 4-point star
    const drawStar = (context, cx, cy, spikes, outerRadius, innerRadius, color) => {
      let rot = (Math.PI / 2) * 3;
      let x = cx;
      let y = cy;
      let step = Math.PI / spikes;

      context.beginPath();
      context.moveTo(cx, cy - outerRadius);
      for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        context.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        context.lineTo(x, y);
        rot += step;
      }
      context.lineTo(cx, cy - outerRadius);
      context.closePath();
      context.fillStyle = color;
      context.fill();
    };

    // Render loop
    const render = (now) => {
      const elapsed = (now - startTime) / 1000;
      const width = canvas.width;
      const height = canvas.height;

      if (width === 0 || height === 0) {
        animationFrameRef.current = requestAnimationFrame(render);
        return;
      }

      const { cellSize, brightness, contrast, pfx, gradientSource, animStyle, animIntensity } = config;
      const speedMult = (config.animSpeed?.intensity || 100) / 100;
      const animIntensityVal = (animIntensity?.intensity || 60) / 100;
      const time = elapsed * speedMult * 1.5;

      // 1. Draw animated gradient source to offscreen canvas
      const ow = offscreen.width;
      const oh = offscreen.height;

      const motionX = Math.sin(time * 0.8) * (gradientSource.motionAmount / 100) * 0.25;
      const motionY = Math.cos(time * 0.6) * (gradientSource.motionAmount / 100) * 0.25;
      const centerX = ow * ((gradientSource.centerX / 100) + motionX);
      const centerY = oh * ((gradientSource.centerY / 100) + motionY);
      const maxRadius = Math.max(ow, oh) * ((gradientSource.scale / 100) || 0.85);

      const radGrad = offCtx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, Math.max(10, maxRadius)
      );

      gradientSource.colors.forEach((c) => {
        radGrad.addColorStop(Math.min(1, Math.max(0, c.pos / 100)), c.hex);
      });

      offCtx.fillStyle = radGrad;
      offCtx.fillRect(0, 0, ow, oh);

      // Sample ImageData from offscreen canvas
      let imgData;
      try {
        imgData = offCtx.getImageData(0, 0, ow, oh);
      } catch (e) {
        animationFrameRef.current = requestAnimationFrame(render);
        return;
      }
      const pixels = imgData.data;

      // 2. Clear main canvas transparently (or dark blend)
      ctx.clearRect(0, 0, width, height);

      // 3. Grid rendering ("stars" mode)
      const scaleX = ow / width;
      const scaleY = oh / height;
      const scaledCellSize = cellSize;

      const cols = Math.ceil(width / scaledCellSize);
      const rows = Math.ceil(height / scaledCellSize);

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const cx = c * scaledCellSize + scaledCellSize / 2;
          const cy = r * scaledCellSize + scaledCellSize / 2;

          // Sample pixel from offscreen
          const px = Math.min(ow - 1, Math.max(0, Math.floor(cx * scaleX)));
          const py = Math.min(oh - 1, Math.max(0, Math.floor(cy * scaleY)));
          const idx = (py * ow + px) * 4;

          let red = pixels[idx] || 0;
          let green = pixels[idx + 1] || 0;
          let blue = pixels[idx + 2] || 0;

          // Luminance calculation
          let lum = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;

          // Apply brightness & contrast
          lum = Math.min(1, Math.max(0, (lum - 0.5) * (contrast / 100) + 0.5 + (brightness / 200)));

          // Wave animation modulation
          let wave = 0;
          if (animStyle === 'wave') {
            wave = Math.sin(c * 0.35 + r * 0.35 + time * 3.0) * 0.35 * animIntensityVal;
          }
          const finalLum = Math.min(1, Math.max(0.1, lum + wave));

          // Draw Star Primitive
          const outerR = (scaledCellSize / 2) * 0.8 * finalLum;
          const innerR = outerR * 0.35;

          // Color calculation
          const starColor = `rgba(${Math.floor(red * (contrast / 100))}, ${Math.floor(green * (contrast / 100))}, ${Math.floor(Math.min(255, blue * 1.2 + 50))}, ${Math.min(1, finalLum + 0.2)})`;

          if (outerR > 1.2) {
            drawStar(ctx, cx, cy, 4, outerR, innerR, starColor);
          } else {
            ctx.fillStyle = starColor;
            ctx.fillRect(cx - 1, cy - 1, 2, 2);
          }
        }
      }

      // 4. Post Effects (PFX)
      // Bloom / Glow pass
      if (pfx?.bloom?.enabled) {
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.globalAlpha = (pfx.bloom.intensity / 100) * 0.3;
        ctx.fillStyle = '#8A2BE2';
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
      }

      // Scanlines effect
      if (pfx?.scanLines?.enabled) {
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, ' + ((pfx.scanLines.intensity / 100) * 0.25) + ')';
        for (let y = 0; y < height; y += 4) {
          ctx.fillRect(0, y, width, 1.5);
        }
        ctx.restore();
      }

      // Film Grain effect
      if (pfx?.filmGrain?.enabled) {
        ctx.save();
        const grainIntensity = (pfx.filmGrain.intensity / 100) * 0.06;
        ctx.fillStyle = 'white';
        for (let i = 0; i < (width * height) / 350; i++) {
          const gx = Math.random() * width;
          const gy = Math.random() * height;
          ctx.globalAlpha = Math.random() * grainIntensity;
          ctx.fillRect(gx, gy, 1, 1);
        }
        ctx.restore();
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      resizeObserver.disconnect();
    };
  }, [config]);

  return (
    <div className={`relative w-full h-full min-h-[300px] overflow-hidden bg-transparent ${className}`}>
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}

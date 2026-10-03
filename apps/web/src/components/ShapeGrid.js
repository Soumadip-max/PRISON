'use client';
import React, { useRef, useEffect } from 'react';

const ShapeGrid = ({
  speed = 0.5,
  squareSize = 40,
  direction = 'diagonal',
  borderColor = '#fff',
  hoverFillColor = '#222',
  shape = 'square',
  hoverTrailAmount = 5
}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let offset = 0;
    const trail = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      trail.push({ x, y, alpha: 1 });
      if (trail.length > hoverTrailAmount) {
        trail.shift(); // keep it constrained to amount
      }
    };
    window.addEventListener('mousemove', handleMouseMove);

    const drawHexagon = (x, y, size) => {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const hx = x + size * Math.cos(angle);
        const hy = y + size * Math.sin(angle);
        if (i === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
    };

    const drawTriangle = (x, y, size) => {
      ctx.beginPath();
      ctx.moveTo(x, y - size / 2);
      ctx.lineTo(x + size / 2, y + size / 2);
      ctx.lineTo(x - size / 2, y + size / 2);
      ctx.closePath();
    };

    const drawCircle = (x, y, size) => {
      ctx.beginPath();
      ctx.arc(x, y, size / 2, 0, Math.PI * 2);
      ctx.closePath();
    };

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      offset += speed;

      // Handle trail fading
      for (let i = 0; i < trail.length; i++) {
        trail[i].alpha -= 0.05;
        if (trail[i].alpha < 0) trail[i].alpha = 0;
      }

      const cols = Math.ceil(canvas.width / squareSize) + 2;
      const rows = Math.ceil(canvas.height / squareSize) + 2;

      let offsetX = 0;
      let offsetY = 0;
      
      const modOffset = offset % squareSize;
      
      switch(direction) {
        case 'diagonal': offsetX = modOffset; offsetY = modOffset; break;
        case 'up': offsetY = -modOffset; break;
        case 'down': offsetY = modOffset; break;
        case 'left': offsetX = -modOffset; break;
        case 'right': offsetX = modOffset; break;
      }

      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 1;

      for (let i = -1; i < cols; i++) {
        for (let j = -1; j < rows; j++) {
          const x = i * squareSize + offsetX;
          const y = j * squareSize + offsetY;

          const cx = x + squareSize / 2;
          const cy = y + squareSize / 2;

          // Check if shape is hovered by any trail point
          let fillAlpha = 0;
          for (const t of trail) {
            const dist = Math.hypot(cx - t.x, cy - t.y);
            if (dist < squareSize * 1.5) {
              fillAlpha = Math.max(fillAlpha, t.alpha * (1 - dist / (squareSize * 1.5)));
            }
          }

          if (fillAlpha > 0) {
            ctx.fillStyle = hoverFillColor;
            ctx.globalAlpha = fillAlpha;
            if (shape === 'square') ctx.fillRect(x, y, squareSize, squareSize);
            else if (shape === 'hexagon') { drawHexagon(cx, cy, squareSize / 2); ctx.fill(); }
            else if (shape === 'circle') { drawCircle(cx, cy, squareSize * 0.8); ctx.fill(); }
            else if (shape === 'triangle') { drawTriangle(cx, cy, squareSize); ctx.fill(); }
            ctx.globalAlpha = 1.0;
          }

          ctx.beginPath();
          if (shape === 'square') {
            ctx.rect(x, y, squareSize, squareSize);
          } else if (shape === 'hexagon') {
            drawHexagon(cx, cy, squareSize / 2);
          } else if (shape === 'circle') {
            drawCircle(cx, cy, squareSize * 0.8);
          } else if (shape === 'triangle') {
            drawTriangle(cx, cy, squareSize);
          }
          ctx.stroke();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [speed, squareSize, direction, borderColor, hoverFillColor, shape, hoverTrailAmount]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0, opacity: 0.12 }}
    />
  );
};

export default ShapeGrid;

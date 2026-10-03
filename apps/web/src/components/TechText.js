'use client';
import React, { useState, useRef, useEffect } from 'react';

const TechText = ({
  text,
  fontWeight = 600,
  fontSize = 150,
  reveal = 'letter',
  dashLength = 4,
  dashGap = 2,
  specks = 15
}) => {
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const characters = text.split('');

  return (
    <div 
      ref={containerRef}
      className="tech-text-container w-full h-full relative flex items-center justify-center font-arcade overflow-visible"
      style={{
        '--dash-length': dashLength,
        '--dash-gap': dashGap,
        '--font-weight': fontWeight,
        '--font-size': `${fontSize}px`,
      }}
    >
      <style>{`
        .tech-text-container {
          perspective: 1000px;
        }
        .tech-letter {
          display: inline-block;
          position: relative;
          color: transparent;
          cursor: grab;
          transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          transform-style: preserve-3d;
        }
        .tech-letter:active {
          cursor: grabbing;
          transform: translate(calc(var(--drag-x, 0) * 1px), calc(var(--drag-y, 0) * 1px)) rotateZ(calc(var(--drag-r, 0) * 1deg)) scale(1.1);
          transition: transform 0.1s linear;
        }
        .tech-letter::before {
          content: attr(data-char);
          position: absolute;
          left: 0;
          top: 0;
          -webkit-text-stroke: 1px rgba(129, 140, 248, 0.5);
          color: transparent;
          opacity: 0.8;
          z-index: 1;
        }
        .tech-letter::after {
          content: attr(data-char);
          position: absolute;
          left: 0;
          top: 0;
          -webkit-text-stroke: 2px #818cf8;
          stroke-dasharray: var(--dash-length) var(--dash-gap);
          animation: dashMove 3s linear infinite;
          z-index: 2;
        }
        .tech-letter:hover::after {
          -webkit-text-stroke: 3px #c7d2fe;
          filter: drop-shadow(0 0 15px #818cf8);
          animation: dashMove 1s linear infinite;
        }
        @keyframes dashMove {
          to { stroke-dashoffset: -50; }
        }
        .speck {
          position: absolute;
          background: #818cf8;
          border-radius: 0;
          pointer-events: none;
          animation: speckFloat 4s infinite ease-in-out;
          box-shadow: 0 0 5px #818cf8;
        }
        @keyframes speckFloat {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.2; }
          50% { transform: translateY(-30px) scale(1.5); opacity: 0.9; }
        }
      `}</style>
      
      <div className="flex gap-1 sm:gap-2 md:gap-4 relative z-10" style={{ fontSize: `clamp(60px, ${fontSize}px, 20vw)`, fontWeight, letterSpacing: '2px' }}>
        {characters.map((char, i) => (
          <InteractiveLetter key={i} char={char} delay={i * 0.1} />
        ))}
      </div>

      {mounted && specks > 0 && (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          {Array.from({ length: specks }).map((_, i) => (
            <div
              key={i}
              className="speck"
              style={{
                width: Math.random() * 3 + 2 + 'px',
                height: Math.random() * 3 + 2 + 'px',
                left: Math.random() * 100 + '%',
                top: Math.random() * 100 + '%',
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${Math.random() * 3 + 2}s`
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const InteractiveLetter = ({ char, delay }) => {
  const ref = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const handleMouseMove = (e) => {
    if (isDragging && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const x = e.clientX - (rect.left + rect.width/2);
      const y = e.clientY - (rect.top + rect.height/2);
      ref.current.style.setProperty('--drag-x', x * 1.5);
      ref.current.style.setProperty('--drag-y', y * 1.5);
      ref.current.style.setProperty('--drag-r', (x * y) * 0.02);
    }
  };

  const handleMouseDown = () => setIsDragging(true);

  const handleMouseUp = () => {
    setIsDragging(false);
    if (ref.current) {
      ref.current.style.setProperty('--drag-x', 0);
      ref.current.style.setProperty('--drag-y', 0);
      ref.current.style.setProperty('--drag-r', 0);
    }
  };

  return (
    <span 
      ref={ref}
      className="tech-letter select-none" 
      data-char={char}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
    >
      {char}
    </span>
  );
}

export default TechText;

'use client';

import { useEffect, useRef } from 'react';

interface WaveformProps {
  audioUrl?: string;
  analyzing?: boolean;
  className?: string;
}

export function Waveform({ audioUrl, analyzing }: WaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawBars = (data: number[]) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = 3;
      const gap = 2;
      const totalWidth = barWidth + gap;
      const numBars = Math.floor(canvas.width / totalWidth);
      data = data.length ? data : Array.from({ length: numBars }, () => Math.random() * 30 + 10);

      for (let i = 0; i < numBars; i++) {
        const height = data[i] || 10;
        const x = i * totalWidth;
        const y = (canvas.height - height) / 2;
        ctx.fillStyle = analyzing ? 'var(--color-cta)' : 'var(--color-primary)';
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, height, 2);
        ctx.fill();
      }
    };

    if (analyzing) {
      const interval = setInterval(() => {
        const bars = Array.from({ length: 40 }, () => Math.random() * 50 + 10);
        drawBars(bars);
      }, 100);
      return () => clearInterval(interval);
    } else {
      drawBars([]);
    }
  }, [analyzing]);

  return (
    <div style={{
      background: 'var(--color-background)',
      borderRadius: '12px',
      padding: '12px',
      overflow: 'hidden',
    }}>
      <canvas
        ref={canvasRef}
        width={500}
        height={48}
        style={{ width: '100%', height: '48px' }}
      />
    </div>
  );
}
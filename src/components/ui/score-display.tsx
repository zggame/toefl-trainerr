'use client';

import { useEffect, useState } from 'react';

interface ScoreDisplayProps {
  score: number;
  maxScore?: number;
  size?: 'sm' | 'md' | 'lg';
  showDecimal?: boolean;
  animated?: boolean;
}

function getScoreColor(score: number, maxScore: number): string {
  const ratio = score / maxScore;
  if (ratio >= 0.875) return 'var(--color-score-excellent)'; // 3.5-4.0
  if (ratio >= 0.625) return 'var(--color-score-good)'; // 2.5-3.4
  if (ratio >= 0.375) return 'var(--color-score-needs-work)'; // 1.5-2.4
  return 'var(--color-score-practice)'; // 0-1.4
}

export function ScoreDisplay({
  score,
  maxScore = 4,
  size = 'md',
  showDecimal = true,
  animated = true,
}: ScoreDisplayProps) {
  const [displayScore, setDisplayScore] = useState(animated ? 0 : score);
  const color = getScoreColor(score, maxScore);

  useEffect(() => {
    if (!animated) {
      setDisplayScore(score);
      return;
    }

    const duration = 800;
    const startTime = Date.now();
    const startValue = 0;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out expo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
      setDisplayScore(startValue + (score - startValue) * eased);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [score, animated]);

  const sizeStyles = {
    sm: { fontSize: '28px', suffixSize: '14px' },
    md: { fontSize: '48px', suffixSize: '20px' },
    lg: { fontSize: '64px', suffixSize: '24px' },
  };

  return (
    <div 
      className="animate-count-up"
      style={{ 
        fontFamily: 'var(--font-mono)',
        fontWeight: 700,
        color,
        lineHeight: 1,
      }}
    >
      <span style={{ fontSize: sizeStyles[size].fontSize }}>
        {showDecimal ? displayScore.toFixed(1) : Math.round(displayScore)}
      </span>
      <span style={{ 
        fontSize: sizeStyles[size].suffixSize,
        color: 'var(--color-text-muted)',
        fontWeight: 500,
      }}>
        {' '}/ {maxScore}
      </span>
    </div>
  );
}

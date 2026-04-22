import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
  hover?: boolean;
  gap?: boolean;
  marginBottom?: string;
  style?: React.CSSProperties;
}

export function Card({
  children,
  className = '',
  padding = 'md',
  onClick,
  hover = true,
  gap = true,
  marginBottom,
  style,
}: CardProps) {
  const paddingStyles = {
    none: { padding: 0 },
    sm: { padding: '12px' },
    md: { padding: '20px' },
    lg: { padding: '24px' },
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!hover || !onClick) return;
    const target = e.currentTarget;
    target.style.transform = 'translateY(-2px)';
    target.style.boxShadow = 'var(--shadow-card-hover)';
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    target.style.transform = 'translateY(0)';
    target.style.boxShadow = 'var(--shadow-card)';
  };

  return (
    <div
      className={className}
      onClick={onClick}
      style={{
        background: 'var(--color-bg-elevated)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-card)',
        boxShadow: 'var(--shadow-card)',
        transition: 'all 200ms ease',
        cursor: onClick ? 'pointer' : 'default',
        marginBottom: marginBottom ?? (gap ? '12px' : undefined),
        marginLeft: '8px',
        marginRight: '8px',
        ...paddingStyles[padding],
        ...style,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
}

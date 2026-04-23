'use client';

import { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit';
  className?: string;
  icon?: ReactNode;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  onClick,
  type = 'button',
  className = '',
  icon,
}: ButtonProps) {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontFamily: 'var(--font-heading)',
    fontWeight: 600,
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 150ms ease',
    borderRadius: 'var(--radius-button)',
    width: fullWidth ? '100%' : 'auto',
    opacity: disabled ? 0.5 : 1,
  } as const;

  const sizeStyles = {
    sm: { padding: '8px 16px', fontSize: '14px' },
    md: { padding: '12px 20px', fontSize: '16px' },
    lg: { padding: '16px 28px', fontSize: '18px' },
  };

  const variantStyles = {
    primary: {
      background: 'var(--color-primary)',
      color: 'white',
      boxShadow: 'var(--shadow-button)',
    },
    secondary: {
      background: 'transparent',
      color: 'var(--color-primary)',
      border: '2px solid var(--color-primary)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--color-text-secondary)',
    },
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    const target = e.currentTarget;
    if (variant === 'primary') {
      target.style.background = 'var(--color-primary-dark)';
      target.style.transform = 'scale(1.02)';
    } else if (variant === 'secondary') {
      target.style.background = 'rgba(79, 70, 229, 0.1)';
    } else {
      target.style.background = 'var(--color-bg-overlay)';
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    const target = e.currentTarget;
    target.style.background = variantStyles[variant].background;
    target.style.transform = 'scale(1)';
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    e.currentTarget.style.transform = 'scale(0.98)';
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.transform = 'scale(1.02)';
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`touch-target ${className}`}
      style={{
        ...baseStyles,
        ...sizeStyles[size],
        ...variantStyles[variant],
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
}

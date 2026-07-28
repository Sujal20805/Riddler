import React from 'react';

const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'volt',
  className = '',
  disabled = false,
  loading = false,
  ...props
}) => {
  const baseStyle = 'brutalist-btn px-5 py-2.5 inline-flex items-center justify-center gap-2 text-sm md:text-base cursor-pointer tracking-wider transition-all disabled:opacity-50 disabled:pointer-events-none active:translate-x-[4px] active:translate-y-[4px] active:shadow-none';
  
  const variants = {
    volt: 'bg-volt text-black shadow-[4px_4px_0px_0px_#000000] hover:bg-volt-dark',
    pink: 'bg-neon-pink text-white shadow-[4px_4px_0px_0px_#000000] hover:bg-pink-600',
    black: 'bg-black text-white shadow-[4px_4px_0px_0px_#ccff00] hover:bg-zinc-900 border-volt',
    cyan: 'bg-neon-cyan text-black shadow-[4px_4px_0px_0px_#000000] hover:bg-cyan-500',
    ghost: 'bg-transparent text-white border-white/20 shadow-[4px_4px_0px_0px_#000000] hover:bg-white/5',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyle} ${variants[variant]} ${className}`}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-5 w-5 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  );
};

export default Button;

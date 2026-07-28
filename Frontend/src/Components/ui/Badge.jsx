import React from 'react';

const Badge = ({
    children,
    variant = 'zinc',
    className = '',
    ...props
}) => {
    const baseStyle = 'inline-flex items-center px-2 py-0.5 border-2 border-black font-heading text-xs font-black uppercase tracking-wider rounded-none select-none';

    const variants = {
        volt: 'bg-volt text-black shadow-[2px_2px_0px_0px_#000000]',
        pink: 'bg-neon-pink text-white shadow-[2px_2px_0px_0px_#000000]',
        cyan: 'bg-neon-cyan text-black shadow-[2px_2px_0px_0px_#000000]',
        zinc: 'bg-zinc-800 text-zinc-300 shadow-[2px_2px_0px_0px_#000000]',
    };

    return (
        <span className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
            {children}
        </span>
    );
};

export default Badge;

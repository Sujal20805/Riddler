import React from 'react';

const Card = ({
    children,
    variant = 'default',
    className = '',
    onClick,
    ...props
}) => {
    const baseStyle = 'bg-zinc-900 border-[3px] border-black rounded-none p-5 relative overflow-hidden transition-all duration-200';

    const variants = {
        default: 'shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]',
        volt: 'shadow-[4px_4px_0px_0px_#ccff00] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#ccff00]',
        pink: 'shadow-[4px_4px_0px_0px_#ec4899] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#ec4899]',
        cyan: 'shadow-[4px_4px_0px_0px_#06b6d4] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#06b6d4]',
        accent: 'shadow-[4px_4px_0px_0px_#ccff00] border-volt',
    };

    const clickableStyle = onClick ? 'cursor-pointer active:translate-x-[2px] active:translate-y-[2px] active:shadow-none' : '';

    return (
        <div
            onClick={onClick}
            className={`${baseStyle} ${variants[variant]} ${clickableStyle} ${className}`}
            {...props}
        >
            {/* Visual cyber mesh overlay inside card */}
            <div className="absolute inset-0 game-dot-grid opacity-[0.15] pointer-events-none" />
            <div className="relative z-10 w-full h-full flex flex-col">
                {children}
            </div>
        </div>
    );
};

export default Card;

import React from 'react';

const FormField = ({
    label,
    error,
    id,
    type = 'text',
    placeholder,
    value,
    onChange,
    className = '',
    icon,
    rightElement,
    ...props
}) => {
    return (
        <div className={`flex flex-col gap-1.5 w-full ${className}`}>
            {label && (
                <label htmlFor={id} className="text-sm font-extrabold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5 font-heading">
                    {label}
                </label>
            )}
            <div className="relative flex items-center w-full">
                {icon && (
                    <span className="absolute left-4 text-zinc-400 pointer-events-none flex items-center justify-center">
                        <i className={icon}></i>
                    </span>
                )}
                <input
                    id={id}
                    type={type}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    className={`w-full px-4 ${icon ? 'pl-11' : 'pl-4'} ${rightElement ? 'pr-11' : 'pr-4'} py-3 
            bg-zinc-900 border-[3px] border-black text-white placeholder-zinc-500 rounded-none
            focus:outline-none focus:border-volt focus:ring-4 focus:ring-volt/20
            transition-all duration-150 font-medium ${error ? 'border-neon-pink focus:border-neon-pink focus:ring-neon-pink/20' : ''
                        }`}
                    {...props}
                />
                {rightElement && (
                    <div className="absolute right-3 flex items-center">
                        {rightElement}
                    </div>
                )}
            </div>
            {error && (
                <span className="text-xs font-bold text-neon-pink mt-1 animate-game-shake uppercase tracking-wider flex items-center gap-1 font-heading">
                    <i className="fa-solid fa-triangle-exclamation"></i> {error}
                </span>
            )}
        </div>
    );
};

export default FormField;

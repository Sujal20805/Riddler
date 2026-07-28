import React from 'react';

const EmptyState = ({
    title = 'No Data Found',
    message = 'There is nothing to display here yet.',
    icon = 'fa-solid fa-folder-open',
    action,
    className = '',
    ...props
}) => {
    return (
        <div
            className={`flex flex-col items-center justify-center p-8 text-center bg-zinc-900 border-[3px] border-black shadow-[4px_4px_0px_0px_#000000] max-w-md mx-auto rounded-none ${className}`}
            {...props}
        >
            <div className="w-16 h-16 flex items-center justify-center border-[3px] border-black bg-volt text-black text-2xl mb-4 shadow-[2px_2px_0px_0px_#000000] rotate-[-3deg]">
                <i className={icon}></i>
            </div>
            <h3 className="text-xl font-black uppercase text-white font-heading tracking-wide mb-2">
                {title}
            </h3>
            <p className="text-zinc-400 text-sm font-medium mb-6 leading-relaxed">
                {message}
            </p>
            {action && (
                <div className="w-full flex justify-center">
                    {action}
                </div>
            )}
        </div>
    );
};

export default EmptyState;

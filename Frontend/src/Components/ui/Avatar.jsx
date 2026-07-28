import React from 'react';

export const generateInitials = (title) => {
    if (!title) return '??';
    const words = title.trim().split(/\s+/);
    if (words.length === 1) {
        return words[0].substring(0, 2).toUpperCase();
    } else if (words.length > 1) {
        return (words[0][0] + words[1][0]).toUpperCase();
    }
    return '??';
};

export const getAvatarColor = (title) => {
    const colors = [
        'bg-volt text-black',
        'bg-neon-pink text-white',
        'bg-neon-cyan text-black',
        'bg-purple-600 text-white',
        'bg-orange-500 text-black',
        'bg-amber-400 text-black',
        'bg-emerald-500 text-white font-bold',
    ];
    let hash = 0;
    for (let i = 0; i < (title?.length || 0); i++) {
        hash = title.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash % colors.length);
    return colors[index];
};

const Avatar = ({
    title,
    size = 'md',
    className = '',
    ...props
}) => {
    const initials = generateInitials(title);
    const colorClass = getAvatarColor(title);

    const sizes = {
        xs: 'w-7 h-7 text-xs border-2',
        sm: 'w-10 h-10 text-sm border-2 shadow-[2px_2px_0px_0px_#000000]',
        md: 'w-14 h-14 text-lg border-[3px] shadow-[3px_3px_0px_0px_#000000]',
        lg: 'w-20 h-20 text-3xl border-[3px] shadow-[4px_4px_0px_0px_#000000]',
        xl: 'w-28 h-28 text-4xl border-[4px] shadow-[4px_4px_0px_0px_#000000]',
        full: 'w-full h-full text-4xl border-[3px]',
    };

    return (
        <div
            className={`inline-flex items-center justify-center font-heading font-black border-black h-fit uppercase rounded-none select-none ${sizes[size]} ${colorClass} ${className}`}
            {...props}
        >
            {initials}
        </div>
    );
};

export default Avatar;

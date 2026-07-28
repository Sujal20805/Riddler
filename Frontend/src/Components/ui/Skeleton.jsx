import React from 'react';

const Skeleton = ({
    className = '',
    ...props
}) => {
    return (
        <div
            className={`bg-zinc-800 brutalist-border animate-pulse rounded-none ${className}`}
            {...props}
        />
    );
};

export default Skeleton;

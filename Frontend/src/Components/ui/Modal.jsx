import React, { useEffect } from 'react';
import Button from './Button';

const Modal = ({
    isOpen,
    onClose,
    title,
    children,
    className = '',
    footer,
    ...props
}) => {
    // Prevent scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Handle escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Container */}
            <div
                className={`relative bg-zinc-900 border-[3px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-lg w-full flex flex-col z-10 animate-pop-bounce rounded-none ${className}`}
                role="dialog"
                aria-modal="true"
                {...props}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b-[3px] border-black p-4 bg-zinc-950">
                    {title && (
                        <h3 className="text-lg font-black uppercase text-volt font-heading tracking-wide">
                            {title}
                        </h3>
                    )}
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center border-2 border-black bg-neon-pink text-white hover:bg-pink-600 transition-colors focus:outline-none"
                        aria-label="Close modal"
                    >
                        <i className="fa-solid fa-xmark text-sm"></i>
                    </button>
                </div>

                {/* Content */}
                <div className="p-5 overflow-y-auto max-h-[70vh] text-zinc-300 font-medium">
                    {children}
                </div>

                {/* Footer */}
                {footer ? (
                    <div className="border-t-[3px] border-black p-4 flex items-center justify-end gap-3 bg-zinc-950">
                        {footer}
                    </div>
                ) : null}
            </div>
        </div>
    );
};

export default Modal;

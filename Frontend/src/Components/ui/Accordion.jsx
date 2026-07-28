import React, { useState } from 'react';

const AccordionItem = ({ title, content, isOpen, onToggle }) => {
    return (
        <div className="border-[3px] border-black shadow-[4px_4px_0px_0px_#000000] bg-zinc-900 rounded-none mb-3 overflow-hidden transition-all duration-200">
            {/* Header / Trigger */}
            <button
                onClick={onToggle}
                className="w-full px-5 py-4 text-left flex justify-between items-center bg-zinc-950 hover:bg-zinc-800 text-white font-heading font-extrabold uppercase tracking-wide transition-colors focus:outline-none"
                aria-expanded={isOpen}
            >
                <span className="pr-4">{title}</span>
                <span className={`w-8 h-8 flex items-center justify-center border-2 border-black ${isOpen ? 'bg-volt text-black' : 'bg-zinc-800 text-white'} transition-colors duration-200`}>
                    <i className={`fa-solid ${isOpen ? 'fa-minus' : 'fa-plus'} text-xs`}></i>
                </span>
            </button>

            {/* Panel / Content */}
            <div
                className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
                    }`}
            >
                <p className="p-5 text-zinc-300 font-medium text-sm md:text-base border-t-[3px] border-black bg-zinc-900 leading-relaxed">
                    {content}
                </p>
            </div>
        </div>
    );
};

const Accordion = ({ items = [], className = '' }) => {
    const [openIndex, setOpenIndex] = useState(null);

    const handleToggle = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className={`w-full ${className}`}>
            {items.map((item, index) => (
                <AccordionItem
                    key={index}
                    title={item.title}
                    content={item.content}
                    isOpen={openIndex === index}
                    onToggle={() => handleToggle(index)}
                />
            ))}
        </div>
    );
};

export default Accordion;

import React from "react";
import { Link } from "react-router-dom";
import Button from "./ui/Button";
import Badge from "./ui/Badge";

const NotFound = () => {
    return (
        <div className="min-h-screen bg-zinc-950 text-white scanlines game-dot-grid flex flex-col items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-neon-pink to-transparent animate-pulse" />

            <div className="text-center max-w-md z-10">
                <Badge variant="pink" className="mb-4 animate-game-shake">
                    CRITICAL ERROR 404
                </Badge>

                <h1 className="text-7xl md:text-9xl font-black text-neon-pink tracking-tighter font-heading mb-4 drop-shadow-[4px_4px_0px_#000000]">
                    OUT OF BOUNDS
                </h1>

                <p className="text-zinc-400 text-sm md:text-base font-body font-medium mb-8 leading-relaxed">
                    The coordinates you requested do not point to a valid quiz chamber. You have entered unmapped cyber-space.
                </p>

                <Link to="/">
                    <Button variant="volt" className="text-sm px-6 py-2.5">
                        <i className="fa-solid fa-house mr-2"></i> ABORT & GO HOME
                    </Button>
                </Link>
            </div>
        </div>
    );
};

export default NotFound;

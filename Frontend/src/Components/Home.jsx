import React from "react";
import { Link } from "react-router-dom";
import Button from "./ui/Button";
import Card from "./ui/Card";

function Home() {
  const isLoggedIn = !!localStorage.getItem("quizAppToken");

  return (
    <div className="min-h-screen bg-zinc-950 text-white scanlines game-dot-grid flex flex-col py-12 px-4 relative overflow-hidden animate-scanline-laser">
      {/* Background neon grid deco lines */}
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse" />

      <div className="animate-slide-up w-full flex flex-col items-center">
        {/* Hero Section */}
        <div className="max-w-6xl mx-auto w-full text-center my-10 flex flex-col items-center z-10">
          <div className="inline-block px-3 py-1 border-2 border-black bg-neon-pink text-white font-heading text-xs font-black uppercase tracking-widest mb-6 rotate-[-2deg] shadow-[2px_2px_0 0 #000]">
            RELEASE V1.0.4: ONLINE BATTLE ARENA
          </div>

          <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter text-white font-heading leading-none mb-6">
            ENGAGE CODE: <br />
            <span className="text-volt drop-shadow-[4px_4px_0_rgba(0,0,0,1)] animate-text-glitch">RIDDLER</span>
          </h1>

          <p className="text-zinc-400 text-lg md:text-xl font-medium max-w-2xl mb-10 leading-relaxed font-body">
            Riddler is a high-octane trivia client. Construct customized testing chambers, invite your challengers, climb the leaderboards, and prove your cognitive superiority.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-md">
            {isLoggedIn ? (
              <Link to="/home" className="w-full sm:w-auto">
                <Button variant="volt" className="w-full text-lg px-8 py-3">
                  ENTER MATCHBOARD
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/signup" className="w-full sm:w-auto">
                  <Button variant="volt" className="w-full text-lg px-8 py-3">
                    INITIALIZE SIGN UP
                  </Button>
                </Link>
                <Link to="/login" className="w-full sm:w-auto">
                  <Button variant="ghost" className="w-full text-lg px-8 py-3">
                    PLAYER LOGIN
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Engagement Steps */}
        <div className="max-w-6xl mx-auto w-full mt-16 z-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card variant="black" className="hover:-translate-y-2">
            <div className="w-12 h-12 flex items-center justify-center border-2 border-black bg-volt text-black text-xl font-heading font-black mb-4">
              01
            </div>
            <h3 className="font-heading font-black text-xl uppercase text-white mb-2 tracking-wide">
              CHOOSE YOUR CHAMBER
            </h3>
            <p className="text-zinc-400 text-sm font-medium leading-relaxed font-body">
              Browse through active quiz chambers built by real gamers or customize your very own customized quest.
            </p>
          </Card>

          <Card variant="default" className="hover:-translate-y-2">
            <div className="w-12 h-12 flex items-center justify-center border-2 border-black bg-neon-cyan text-black text-xl font-heading font-black mb-4">
              02
            </div>
            <h3 className="font-heading font-black text-xl uppercase text-white mb-2 tracking-wide">
              SUBMIT VERDICTS
            </h3>
            <p className="text-zinc-400 text-sm font-medium leading-relaxed font-body">
              Beat the clock, avoid pitfalls, select options, and gain high multipliers for correct streaks.
            </p>
          </Card>

          <Card variant="pink" className="hover:-translate-y-2">
            <div className="w-12 h-12 flex items-center justify-center border-2 border-black bg-neon-pink text-white text-xl font-heading font-black mb-4">
              03
            </div>
            <h3 className="font-heading font-black text-xl uppercase text-white mb-2 tracking-wide">
              CLAIM RATING POINTS
            </h3>
            <p className="text-zinc-400 text-sm font-medium leading-relaxed font-body">
              Ranks are processed instantly! Watch your status update on the global leaderboard against the elites.
            </p>
          </Card>
        </div>

        {/* Tactical Stats strip */}
        <div className="max-w-6xl mx-auto w-full my-20 z-10">
          <div className="border-[3px] border-black bg-zinc-950 p-6 shadow-[6px_6px_0_0_rgba(204,255,0,1)] grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="font-heading font-black text-3xl md:text-5xl text-volt">15K+</div>
              <div className="text-xs uppercase font-extrabold tracking-wider text-zinc-500 mt-1 font-body">Quizzes Created</div>
            </div>
            <div>
              <div className="font-heading font-black text-3xl md:text-5xl text-neon-cyan">230K+</div>
              <div className="text-xs uppercase font-extrabold tracking-wider text-zinc-500 mt-1 font-body">Questions Solved</div>
            </div>
            <div>
              <div className="font-heading font-black text-3xl md:text-5xl text-neon-pink">98%</div>
              <div className="text-xs uppercase font-extrabold tracking-wider text-zinc-500 mt-1 font-body">Adrenaline Level</div>
            </div>
            <div>
              <div className="font-heading font-black text-3xl md:text-5xl text-white">4.9s</div>
              <div className="text-xs uppercase font-extrabold tracking-wider text-zinc-500 mt-1 font-body">Avg Res Time</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
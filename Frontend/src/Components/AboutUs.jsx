import React from "react";
import Card from "./ui/Card";
import Badge from "./ui/Badge";

function AboutUs() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white scanlines game-dot-grid flex flex-col py-12 px-4 relative overflow-hidden animate-scanline-laser">
      <div className="max-w-5xl mx-auto w-full z-10 flex-grow animate-slide-up">
        {/* Title Header */}
        <div className="text-center mb-16">
          <Badge variant="volt" className="mb-4">SYSTEM DOSSIER</Badge>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white font-heading">
            ABOUT <span className="text-volt">RIDDLER</span>
          </h1>
          <p className="text-zinc-500 font-medium text-sm md:text-base mt-2 font-body max-w-xl mx-auto">
            Operational details, mission objectives, and communication protocols for the Riddler testing nodes.
          </p>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <Card variant="black">
            <h2 className="text-2xl font-black uppercase text-volt mb-3 flex items-center gap-2 font-heading">
              <i className="fa-solid fa-gamepad"></i> WHO WE ARE
            </h2>
            <p className="text-zinc-300 text-sm md:text-base leading-relaxed font-body">
              Riddler is an online quiz combat zone engineered for knowledge-seekers, trivia lovers, and hyper-competitive intellects. We provide custom-designed matches spanning general knowledge to niche science, offering an interactive challenge space for gamers worldwide.
            </p>
          </Card>

          <Card variant="cyan">
            <h2 className="text-2xl font-black uppercase text-neon-cyan mb-3 flex items-center gap-2 font-heading">
              <i className="fa-solid fa-bullseye"></i> OUR VISION
            </h2>
            <p className="text-zinc-300 text-sm md:text-base leading-relaxed font-body">
              We translate passive education into high-stakes gamified competitions. Our goal is to connect inquisitive minds globally in a secure sandbox that rewards continuous cognitive training and rapid reaction times.
            </p>
          </Card>

          <Card variant="pink">
            <h2 className="text-2xl font-black uppercase text-neon-pink mb-3 flex items-center gap-2 font-heading">
              <i className="fa-solid fa-bolt"></i> OUR MOTTO
            </h2>
            <p className="text-zinc-300 text-sm md:text-base leading-relaxed font-body font-mono">
              "CHALLENGE. LEARN. CONQUER." <br />
              At Riddler, every round is an operational trial. Failure is simply a calibration stage; intellectual dominance is the final goal.
            </p>
          </Card>

          <Card variant="default">
            <h2 className="text-2xl font-black uppercase text-white mb-3 flex items-center gap-2 font-heading">
              <i className="fa-solid fa-list-check"></i> OBJECTIVES
            </h2>
            <ul className="text-zinc-300 text-sm leading-relaxed font-body space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-volt font-black"><i className="fa-solid fa-square-caret-right"></i></span>
                Store a continuously scaling library of high-fidelity user-built quizzes.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-volt font-black"><i className="fa-solid fa-square-caret-right"></i></span>
                Host secure multiplayer matching rooms for player status trials.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-volt font-black"><i className="fa-solid fa-square-caret-right"></i></span>
                Incorporate real-time ranking formulas and points accumulation.
              </li>
            </ul>
          </Card>
        </div>

        {/* Contact Info Block */}
        <Card variant="accent" className="mb-12">
          <h2 className="text-2xl font-black uppercase text-black bg-volt border-[3px] border-black px-3 py-1.5 w-fit font-heading rotate-[-1deg] mb-6 shadow-[2px_2px_0_0_#000]">
            ESTABLISH CONTACT
          </h2>
          <p className="text-zinc-300 text-sm md:text-base mb-6 font-body">
            Encountering bugs in the quiz chambers or require priority client help? Reach out directly:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs md:text-sm">
            <div className="bg-zinc-950 border-[3px] border-black p-4">
              <span className="text-volt font-bold uppercase block mb-1">EMAIL SUPPORT</span>
              <span className="text-zinc-400">support@riddler.com</span>
            </div>
            <div className="bg-zinc-950 border-[3px] border-black p-4">
              <span className="text-neon-cyan font-bold uppercase block mb-1">HOTLINE CHANNEL</span>
              <span className="text-zinc-400">+91 1234567890</span>
            </div>
            <div className="bg-zinc-950 border-[3px] border-black p-4">
              <span className="text-neon-pink font-bold uppercase block mb-1">sandBox base</span>
              <span className="text-zinc-400">123 Trivia City, Knowledge Land</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default AboutUs;
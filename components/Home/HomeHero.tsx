import React from "react";

const HomeHero: React.FC = () => {
  return (
    <section className="relative w-full bg-[#101828]">
      {/* Subtle sporty overlays (very low opacity) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        {/* faint grid for a “scoreboard/field” vibe */}
        <div
          className="absolute inset-0 opacity-[0.3]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.25) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.25) 1px, transparent 1px)",
            backgroundSize: "70px 70px",
          }}
        />
        {/* soft gradient accents */}
        <span
          className="absolute -top-10 -right-8 h-48 w-48 rounded-full blur-2xl opacity-[0.18]"
          style={{
            background:
              "radial-gradient(circle at 40% 40%, #c5368f 0%, transparent 60%)",
          }}
        />
        <span
          className="absolute -bottom-12 -left-6 h-56 w-56 rounded-full blur-2xl opacity-[0.16]"
          style={{
            background:
              "radial-gradient(circle at 60% 60%, #278394 0%, transparent 55%)",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-[1420px]  px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-28">
        {/* Minimal badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{
              background:
                "linear-gradient(90deg, #c5368f 0%, #27297d 50%, #278394 100%)",
            }}
          />
          <span className="text-[11px] tracking-widest uppercase text-white/60 font-poppins">
            Sports Analytics
          </span>
        </div>

        {/* Heading */}
        <h1 className="mt-5 font-playfair text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.15] text-white">
          Smarter Way to{" "}
          <span className="inline-block">
            <span className=" bg-clip-text text-white">Bet The Board</span>
          </span>
        </h1>

        {/* Subheading */}
        <p className="mt-4 text-base sm:text-lg lg:text-xl text-white/70 font-poppins">
          Real stats. Real predictions. No fluff
        </p>

        {/* Description */}
        <p className="mt-6 max-w-2xl text-sm sm:text-base lg:text-lg leading-relaxed text-white/60 font-poppins">
          We combine trusted data sources with transparent, repeatable models to
          surface edges you can actually use. No noise—just disciplined,
          actionable insight across the leagues you follow.
        </p>

        {/* (Removed bottom section per your request) */}
      </div>
    </section>
  );
};

export default HomeHero;

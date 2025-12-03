// components/NavBar.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";

const LeagueLogos = {
  NFL: () => (
    <Image
      src="/nfl.svg"
      alt="NFL"
      width={30}
      height={30}
      className="w-7 h-7"
    />
  ),
  NBA: () => (
    <Image
      src="/nba-6.svg"
      alt="NBA"
      width={30}
      height={30}
      className="w-7 h-7"
    />
  ),
  NCAAF: () => (
    <Image
      src="/ncaaf.svg"
      alt="NCAAF"
      width={30}
      height={30}
      className="w-7 h-7"
    />
  ),
  NCAAB: () => (
    <Image
      src="/ncaa-1.svg"
      alt="NCAAB"
      width={30}
      height={30}
      className="w-7 h-7"
    />
  ),
  MLB: () => (
    <Image
      src="/mlb-1.svg"
      alt="MLB"
      width={30}
      height={30}
      className="w-7 h-7"
    />
  ),
  UFC: () => (
    <Image
      src="/UFC/ufc.png"
      alt="UFC"
      width={30}
      height={30}
      className="w-7 h-7"
    />
  ),
};

const leagues = [
  { href: "/league/nfl", label: "NFL", logo: LeagueLogos.NFL },
  { href: "/league/nba", label: "NBA", logo: LeagueLogos.NBA },
  { href: "/league/ncaaf", label: "NCAAF", logo: LeagueLogos.NCAAF },
  { href: "/league/ncaab", label: "NCAAB", logo: LeagueLogos.NCAAB },
  { href: "/league/mlb", label: "MLB", logo: LeagueLogos.MLB },
  { href: "/league/ufc", label: "MMA", logo: LeagueLogos.UFC },
];

function NavBar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [deskLeagueOpen, setDeskLeagueOpen] = useState(false);
  const [mobileLeagueOpen, setMobileLeagueOpen] = useState(false);

  // Only enable hover-open on devices that support hover (mouse)
  const [supportsHover, setSupportsHover] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setSupportsHover(mql.matches);
    update();
    mql.addEventListener?.("change", update);
    // @ts-ignore - Safari fallback
    mql.addListener?.(update);
    return () => {
      mql.removeEventListener?.("change", update);
      // @ts-ignore - Safari fallback
      mql.removeListener?.(update);
    };
  }, []);

  // Desktop dropdown: close on outside click/tap
  const leagueRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const onOutside = (e: MouseEvent | TouchEvent) => {
      if (leagueRef.current && !leagueRef.current.contains(e.target as Node)) {
        setDeskLeagueOpen(false);
      }
    };
    document.addEventListener("mousedown", onOutside);
    document.addEventListener("touchstart", onOutside);
    return () => {
      document.removeEventListener("mousedown", onOutside);
      document.removeEventListener("touchstart", onOutside);
    };
  }, []);

  // When closing mobile menu, also collapse its league section
  useEffect(() => {
    if (!mobileMenuOpen) setMobileLeagueOpen(false);
  }, [mobileMenuOpen]);

  return (
    <nav className="w-full bg-white border-b border-gray-200 sticky top-0 z-50 shadow-md font-inter">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="  h-20 flex items-center">
            <Image src="/WebLogo.png" width={160} height={20} alt="Logo" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center">
            {/* Home Link */}
            <Link
              href="/"
              className="text-[#111827] font-medium text-base hover:text-[#278394] transition-colors duration-300 relative group"
            >
              Home
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#278394] transition-all duration-300 group-hover:w-full" />
            </Link>

            {/* League Dropdown (desktop) */}
            <div
              ref={leagueRef}
              className="relative py-5 px-10 mr-5 "
              onMouseEnter={
                supportsHover ? () => setDeskLeagueOpen(true) : undefined
              }
              onMouseLeave={
                supportsHover ? () => setDeskLeagueOpen(false) : undefined
              }
            >
              <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={deskLeagueOpen}
                onClick={() => setDeskLeagueOpen((v) => !v)} // click/tap toggle
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setDeskLeagueOpen((v) => !v);
                  }
                }}
                className="flex cursor-pointer items-center gap-2 text-[#111827] font-medium text-base hover:text-[#278394] transition-colors duration-300 relative group"
              >
                Leagues
                {deskLeagueOpen ? (
                  <FiChevronUp className="w-4 h-4" />
                ) : (
                  <FiChevronDown className="w-4 h-4" />
                )}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#278394] transition-all duration-300 group-hover:w-full" />
              </button>

              {deskLeagueOpen && (
                <div
                  role="menu"
                  className="absolute top-full left-0 w-52 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
                >
                  {leagues.map((league) => {
                    const LogoComponent = league.logo;
                    return (
                      <Link
                        key={league.href}
                        href={league.href}
                        role="menuitem"
                        onClick={() => setDeskLeagueOpen(false)} // close after click
                        className="flex items-center gap-3 px-4 py-3 text-[#111827] font-medium hover:bg-gray-50 hover:text-[#278394] transition-colors duration-200"
                      >
                        <LogoComponent />
                        <span>{league.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="lg:hidden p-2 text-[#111827] hover:text-[#278394]"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-100 py-4 space-y-2">
            {/* Mobile Home */}
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 text-[#111827] font-medium hover:bg-gray-50 hover:text-[#278394] transition-colors duration-200"
            >
              Home
            </Link>

            {/* Mobile League Dropdown */}
            <div>
              <button
                onClick={() => setMobileLeagueOpen((v) => !v)}
                aria-expanded={mobileLeagueOpen}
                className="w-full flex items-center justify-between px-4 py-3 text-[#111827] font-medium hover:bg-gray-50 hover:text-[#278394] transition-colors duration-200"
              >
                <span>League</span>
                {mobileLeagueOpen ? (
                  <FiChevronUp className="w-4 h-4" />
                ) : (
                  <FiChevronDown className="w-4 h-4" />
                )}
              </button>

              {mobileLeagueOpen && (
                <div className="bg-gray-50">
                  {leagues.map((league) => {
                    const LogoComponent = league.logo;
                    return (
                      <Link
                        key={league.href}
                        href={league.href}
                        onClick={() => {
                          setMobileLeagueOpen(false);
                          setMobileMenuOpen(false);
                        }}
                        className="flex items-center gap-3 pl-8 pr-4 py-3 text-[#111827] font-medium hover:bg-gray-100 hover:text-[#278394] transition-colors duration-200"
                      >
                        <LogoComponent />
                        <span>{league.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default NavBar;

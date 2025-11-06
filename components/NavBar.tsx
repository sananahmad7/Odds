"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

const LeagueLogos = {
  NFL: () => (
    <Image
      src="/nfl.svg" // <- file lives in /public/nfl.svg
      alt="NFL"
      width={30}
      height={30}
      className="w-7 h-7"
      priority={false}
    />
  ),
  NBA: () => (
    <Image
      src="/nba-6.svg" // <- file lives in /public/nfl.svg
      alt="NFL"
      width={30}
      height={30}
      className="w-7 h-7"
      priority={false}
    />
  ),
  NCAAF: () => (
    <Image
      src="/ncaaf.svg" // <- file lives in /public/nfl.svg
      alt="NFL"
      width={30}
      height={30}
      className="w-7 h-7"
      priority={false}
    />
  ),
  NCAAB: () => (
    <Image
      src="/ncaa-1.svg" // <- file lives in /public/nfl.svg
      alt="NFL"
      width={30}
      height={30}
      className="w-7 h-7"
      priority={false}
    />
  ),
  MLB: () => (
    <Image
      src="/mlb-1.svg" // <- file lives in /public/nfl.svg
      alt="NFL"
      width={30}
      height={30}
      className="w-7 h-7"
      priority={false}
    />
  ),
  UFC: () => (
    <Image
      src="/ufc.png" // <- file lives in /public/nfl.svg
      alt="NFL"
      width={30}
      height={30}
      className="w-7 h-7"
      priority={false}
    />
  ),
};

const leagues = [
  { href: "/league/nfl", label: "NFL", logo: LeagueLogos.NFL },
  { href: "/league/nba", label: "NBA", logo: LeagueLogos.NBA },
  { href: "/league/ncaaf", label: "NCAAF", logo: LeagueLogos.NCAAF },
  { href: "/league/ncaab", label: "NCAAB", logo: LeagueLogos.NCAAB },
  { href: "/league/mlb", label: "MLB", logo: LeagueLogos.MLB },
  { href: "/league/ufc", label: "UFC", logo: LeagueLogos.UFC },
];

function NavBar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [leagueDropdownOpen, setLeagueDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Handle search logic here
      console.log("Searching for:", searchQuery);
    }
  };

  return (
    <nav className="w-full bg-white border-b border-gray-100 sticky top-0 z-50 shadow-md font-inter">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <Image src="/WebLogo.png" width={150} height={150} alt="Logo" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center">
            {/* Home Link */}
            <Link
              href="/"
              className="text-[#111827] font-medium text-base hover:text-[#278394] transition-colors duration-300 relative group"
            >
              Home
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#278394] transition-all duration-300 group-hover:w-full"></span>
            </Link>

            {/* League Dropdown */}
            <div
              className="relative py-5 px-10"
              onMouseEnter={() => setLeagueDropdownOpen(true)}
              onMouseLeave={() => setLeagueDropdownOpen(false)}
            >
              <button className="flex items-center gap-2 text-[#111827] font-medium text-base hover:text-[#278394] transition-colors duration-300 relative group">
                League
                <svg
                  className={`w-4 h-4 transition-transform duration-300 ${
                    leagueDropdownOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#278394] transition-all duration-300 group-hover:w-full"></span>
              </button>

              {/* Dropdown Menu */}
              {leagueDropdownOpen && (
                <div className="absolute top-full left-0 w-52 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                  {leagues.map((league) => {
                    const LogoComponent = league.logo;
                    return (
                      <Link
                        key={league.href}
                        href={league.href}
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

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 px-4 py-2 pl-10 text-[#111827] bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#278394] focus:border-transparent transition-all duration-300"
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </form>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
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
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="px-4 pb-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 pl-10 text-[#111827] bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#278394] focus:border-transparent"
                />
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </form>

            {/* Mobile Home */}
            <Link
              href="/"
              className="block px-4 py-3 text-[#111827] font-medium hover:bg-gray-50 hover:text-[#278394] transition-colors duration-200"
            >
              Home
            </Link>

            {/* Mobile League Dropdown */}
            <div>
              <button
                onClick={() => setLeagueDropdownOpen(!leagueDropdownOpen)}
                className="w-full flex items-center justify-between px-4 py-3 text-[#111827] font-medium hover:bg-gray-50 hover:text-[#278394] transition-colors duration-200"
              >
                <span>League</span>
                <svg
                  className={`w-4 h-4 transition-transform duration-300 ${
                    leagueDropdownOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Mobile League Items */}
              {leagueDropdownOpen && (
                <div className="bg-gray-50">
                  {leagues.map((league) => {
                    const LogoComponent = league.logo;
                    return (
                      <Link
                        key={league.href}
                        href={league.href}
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

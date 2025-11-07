"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FiInstagram, FiTwitter } from "react-icons/fi";

export default function Footer() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<null | { ok: boolean; msg: string }>(
    null
  );

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    if (!name.trim() || !email.trim() || !message.trim()) {
      setStatus({ ok: false, msg: "Please fill in all fields." });
      return;
    }

    setSending(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      if (!res.ok) throw new Error("Failed to send message");
      setStatus({ ok: true, msg: "Thanks! Your message has been sent." });
      setName("");
      setEmail("");
      setMessage("");
    } catch {
      setStatus({ ok: false, msg: "Something went wrong. Please try again." });
    } finally {
      setSending(false);
    }
  };

  return (
    <footer className="mt-20 bg-[#111827] text-white">
      {/* Brand accent line */}
      <div className="h-1 w-full bg-[#24257C]" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* 1) Logo + desc + socials */}
          <div>
            <div className="flex items-center gap-3">
              <Image
                src="/WebLogo.png" // swap if needed
                alt="DGenSports"
                width={200}
                height={100}
                priority
                className="block h-30 w-auto" // no extra vertical space
              />
            </div>

            <p className="mt-4 text-white/80 leading-relaxed">
              Real data. Real analysis. Updated daily. DGenSports delivers
              concise breakdowns and odds you can scan fast—no fluff, just
              signal.
            </p>

            <div className="mt-15 flex items-center gap-4">
              <Link
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="DGenSports on X (Twitter)"
                className="inline-flex items-center justify-center rounded-full p-2 border border-white/25 text-white/90 hover:text-white hover:bg-[#C83495] hover:border-[#C83495] transition-colors"
              >
                <FiTwitter className="h-5 w-5" />
              </Link>
              <Link
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="DGenSports on Instagram"
                className="inline-flex items-center justify-center rounded-full p-2 border border-white/25 text-white/90 hover:text-white hover:bg-[#C83495] hover:border-[#C83495] transition-colors"
              >
                <FiInstagram className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* 2) Leagues */}
          <div>
            <h3 className="text-lg font-semibold">Leagues</h3>
            <ul className="mt-4 space-y-5">
              {[
                { label: "NFL", href: "/league/nfl" },
                { label: "NBA", href: "/league/nba" },
                { label: "NCAAF", href: "/league/ncaaf" },
                { label: "NCAAB", href: "/league/ncaab" },
                { label: "MLB", href: "/league/mlb" },
                { label: "UFC", href: "/league/ufc" },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-white/80 hover:text-[#C83495] transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 3) Contact */}
          <div>
            <h3 className="text-lg font-semibold">Contact Us</h3>
            <form onSubmit={onSubmit} className="mt-4 space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm text-white/80">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-md border border-white/15 bg-white/5 px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#25818F] focus:border-transparent"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm text-white/80">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-md border border-white/15 bg-white/5 px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#25818F] focus:border-transparent"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm text-white/80"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="mt-1 w-full rounded-md border border-white/15 bg-white/5 px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#25818F] focus:border-transparent"
                  placeholder="How can we help?"
                />
              </div>

              {status && (
                <p
                  className={`text-sm ${
                    status.ok ? "text-[#79d6e0]" : "text-[#ff96cf]"
                  }`}
                >
                  {status.msg}
                </p>
              )}

              <button
                type="submit"
                disabled={sending}
                className="inline-flex items-center justify-center rounded-md bg-[#24257C] px-4 py-2 font-semibold text-white transition-colors hover:bg-[#C83495] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {sending ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>
        </div>

        {/* Bottom row */}
        <div className="mt-10 border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/60">
            © {new Date().getFullYear()} DGenSports. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm">
            <Link
              href="/terms"
              className="text-white/70 hover:text-[#C83495] transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              className="text-white/70 hover:text-[#C83495] transition-colors"
            >
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

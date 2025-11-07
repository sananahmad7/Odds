"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/admin/blogs";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Login failed");
      router.replace(next);
    } catch (err: any) {
      setMsg(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white border border-gray-200 shadow-xl rounded-2xl p-8">
        <div className="flex flex-col items-center">
          <Image
            src="/WebLogo.png"
            alt="DGen Sports"
            width={140}
            height={140}
            className="mb-2"
          />
          <h1 className="text-2xl font-semibold text-[#111827]">Admin Login</h1>
          <p className="text-sm text-gray-500 mt-1">
            Sign in to manage content
          </p>
        </div>

        <form onSubmit={onSubmit} className="mt-8 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#278394]"
              placeholder="you@dgen.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="mt-1 relative">
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 pr-12 focus:outline-none focus:ring-2 focus:ring-[#278394]"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[#278394]"
              >
                {showPw ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {msg && <p className="text-sm text-red-600">{msg}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full cursor-pointer rounded-lg bg-[#24257C] py-2.5 text-white font-semibold hover:bg-[#C83495] transition disabled:opacity-70"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

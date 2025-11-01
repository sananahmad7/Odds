// components/admin/AdminSidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { HiMenuAlt3, HiX } from "react-icons/hi";
import {
  MdArticle,
  MdCategory,
  MdAdd,
  MdMessage,
  MdLogout,
} from "react-icons/md";
import { RiDashboardFill } from "react-icons/ri";

type NavItem = { href: string; label: string; icon: React.ReactNode };

const NAV_ITEMS: NavItem[] = [
  {
    href: "/admin/blogs",
    label: "Blogs",
    icon: <MdArticle className="w-6 h-6" />,
  },
  {
    href: "/admin/categories",
    label: "Categories",
    icon: <MdCategory className="w-6 h-6" />,
  },
  {
    href: "/admin/addBlogs",
    label: "Add Blog",
    icon: <MdAdd className="w-6 h-6" />,
  },
  {
    href: "/admin/contact",
    label: "Contact",
    icon: <MdMessage className="w-6 h-6" />,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false); // mobile drawer

  // Close the mobile drawer whenever route changes
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    if (confirm("Are you sure you want to logout?")) {
      localStorage.clear();
      window.location.href = "/admin/login";
    }
  };

  return (
    <>
      {/* Top bar (mobile only) */}
      <div className="md:hidden sticky top-0 z-40 bg-black/95 backdrop-blur border-b border-gray-800">
        <div className="flex items-center justify-between px-5 py-4">
          <button
            aria-label="Open menu"
            onClick={() => setOpen(true)}
            className="inline-flex items-center justify-center rounded-lg border border-gray-700 px-3 py-2 hover:bg-gray-800 transition-colors"
          >
            <HiMenuAlt3 className="w-6 h-6 text-white" />
          </button>
          <div className="text-xl font-playfair text-white font-semibold">
            Admin
          </div>
          <div className="w-10" />
        </div>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col md:sticky md:top-0 md:h-screen md:w-72 border-r border-gray-800 bg-black">
        <Header />
        <Nav pathname={pathname} />
        <Footer onLogout={handleLogout} />
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <button
            aria-label="Close menu"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-80 bg-black shadow-2xl flex flex-col border-r border-gray-800">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-800">
              <div className="text-2xl font-playfair text-white font-semibold">
                Admin
              </div>
              <button
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                className="rounded-lg border border-gray-700 p-2 hover:bg-gray-800 transition-colors"
              >
                <HiX className="w-6 h-6 text-white" />
              </button>
            </div>
            <Nav pathname={pathname} />
            <Footer onLogout={handleLogout} />
          </aside>
        </div>
      )}
    </>
  );
}

/* ---------- Pieces ---------- */

function Header() {
  return (
    <div className="px-6 py-7 border-b border-gray-800 bg-gradient-to-br from-gray-900 to-black">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2.5  rounded-xl shadow-lg">
          <RiDashboardFill className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-xl 2xl:text-3xl font-bold tracking-wide font-playfair text-white">
          Blog CMS
        </h1>
      </div>
    </div>
  );
}

function Nav({ pathname }: { pathname: string }) {
  return (
    <nav className="flex-1 overflow-y-auto p-4 space-y-2">
      {NAV_ITEMS.map(({ href, label, icon }) => {
        const active =
          pathname === href ||
          (href !== "/admin/addBlogs" && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            className={`group flex items-center gap-4 rounded-xl px-4 py-3.5 transition-all duration-200 relative overflow-hidden
              ${
                active
                  ? "bg-[#278394] text-white "
                  : "text-gray-300 hover:bg-gray-800/50 hover:text-white"
              }`}
          >
            <span
              className={`shrink-0 transition-transform duration-200 ${
                active ? "" : "group-hover:scale-110"
              }`}
            >
              {icon}
            </span>
            <span className="text-base xl:text-xl :font-medium font-poppins relative z-10">
              {label}
            </span>

            {/* Active indicator */}
            {active && (
              <div className="ml-auto w-2 h-2 rounded-full bg-white animate-pulse" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

function Footer({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="p-4 border-t border-gray-800 bg-black">
      <button
        onClick={onLogout}
        className="group w-full inline-flex items-center justify-center gap-3 rounded-xl bg-[#278394] px-4 py-3.5 text-base font-medium text-white font-poppins hover transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
      >
        <MdLogout className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" />
        Logout
      </button>
    </div>
  );
}

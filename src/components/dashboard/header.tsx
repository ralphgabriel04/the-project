"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/database";
import {
  Bars3Icon,
  BellIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";

interface HeaderProps {
  profile: Profile;
}

export function DashboardHeader({ profile }: HeaderProps) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="h-16 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-6 lg:ml-64">
      {/* Mobile menu button */}
      <button
        type="button"
        className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        <Bars3Icon className="h-6 w-6" />
      </button>

      {/* Page title placeholder */}
      <div className="flex-1 lg:flex-none" />

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button
          type="button"
          className="p-2 text-slate-400 hover:text-white transition-colors relative"
        >
          <BellIcon className="h-6 w-6" />
          {/* Notification badge - placeholder */}
          {/* <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" /> */}
        </button>

        {/* User menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-700 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">
              {profile.first_name[0]}
              {profile.last_name[0]}
            </div>
            <span className="hidden sm:block text-sm text-white">
              {profile.first_name}
            </span>
          </button>

          {/* Dropdown menu */}
          {isMenuOpen && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsMenuOpen(false)}
              />

              {/* Menu */}
              <div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-lg z-20 py-2">
                <div className="px-4 py-2 border-b border-slate-700">
                  <p className="text-sm font-medium text-white">
                    {profile.first_name} {profile.last_name}
                  </p>
                  <p className="text-xs text-slate-400 capitalize">
                    {profile.role}
                  </p>
                </div>

                <Link
                  href="/dashboard/settings"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <UserCircleIcon className="h-5 w-5" />
                  Mon profil
                </Link>

                <Link
                  href="/dashboard/settings"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Cog6ToothIcon className="h-5 w-5" />
                  Paramètres
                </Link>

                <hr className="my-2 border-slate-700" />

                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-slate-700 hover:text-red-300 transition-colors w-full disabled:opacity-50"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                  {isLoggingOut ? "Déconnexion..." : "Se déconnecter"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}


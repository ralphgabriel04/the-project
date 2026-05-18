"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Profile } from "@/types/database";
import {
  HomeIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  CalendarIcon,
  Cog6ToothIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  PlayIcon,
} from "@heroicons/react/24/outline";

interface SidebarProps {
  profile: Profile;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: ("coach" | "athlete")[];
}

const navigation: NavItem[] = [
  {
    name: "Tableau de bord",
    href: "/dashboard",
    icon: HomeIcon,
    roles: ["coach", "athlete"],
  },
  {
    name: "Commencer",
    href: "/dashboard/workout",
    icon: PlayIcon,
    roles: ["athlete"],
  },
  {
    name: "Mes Athlètes",
    href: "/dashboard/athletes",
    icon: UserGroupIcon,
    roles: ["coach"],
  },
  {
    name: "Mes Coachs",
    href: "/dashboard/coaches",
    icon: UserGroupIcon,
    roles: ["athlete"],
  },
  {
    name: "Programmes",
    href: "/dashboard/programs",
    icon: ClipboardDocumentListIcon,
    roles: ["coach", "athlete"],
  },
  {
    name: "Calendrier",
    href: "/dashboard/calendar",
    icon: CalendarIcon,
    roles: ["coach", "athlete"],
  },
  {
    name: "Ma Progression",
    href: "/dashboard/progress",
    icon: ChartBarIcon,
    roles: ["athlete"],
  },
  {
    name: "Messages",
    href: "/dashboard/messages",
    icon: ChatBubbleLeftRightIcon,
    roles: ["coach", "athlete"],
  },
  {
    name: "Paramètres",
    href: "/dashboard/settings",
    icon: Cog6ToothIcon,
    roles: ["coach", "athlete"],
  },
];

export function DashboardSidebar({ profile }: SidebarProps) {
  const pathname = usePathname();

  const filteredNavigation = navigation.filter((item) =>
    item.roles.includes(profile.role),
  );

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-slate-800 border-r border-slate-700">
      {/* Logo */}
      <div className="flex items-center gap-2 h-16 px-6 border-b border-slate-700">
        <span className="text-2xl">🏋️</span>
        <span className="font-bold text-white text-lg">THE PROJECT</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {filteredNavigation.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg
                text-sm font-medium transition-all duration-200
                ${
                  isActive
                    ? "bg-emerald-600 text-white"
                    : "text-slate-300 hover:bg-slate-700 hover:text-white"
                }
              `}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User info at bottom */}
      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold">
            {profile.first_name[0]}
            {profile.last_name[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {profile.first_name} {profile.last_name}
            </p>
            <p className="text-xs text-slate-400 capitalize">{profile.role}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}


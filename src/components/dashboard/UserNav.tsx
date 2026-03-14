"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger, 
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, Settings, User } from "lucide-react";

export function UserNav() {
  const { data: session, status } = useSession();
  const [imageFailed, setImageFailed] = useState(false);

  if (status === "loading") return <div className="h-9 w-9 animate-pulse rounded-full bg-slate-200/70" />;
  if (!session) return null;

  const avatarSrc =
    !imageFailed &&
    typeof session.user?.image === "string" &&
    session.user.image.startsWith("http")
      ? session.user.image
      : "";
  const initials = session.user?.name?.trim()?.[0]?.toUpperCase() || "U";

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger className="kivo-chip relative h-10 w-10 cursor-pointer overflow-hidden rounded-full border outline-none transition-all hover:bg-white/95">
          <Avatar className="h-10 w-10 border-0">
            <AvatarImage
              src={avatarSrc}
              alt={session.user?.name || "Profile photo"}
              referrerPolicy="no-referrer"
              onError={() => setImageFailed(true)}
            />
            <AvatarFallback className="bg-gradient-to-br from-blue-100 to-emerald-100 text-blue-800 font-bold text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="mt-2 w-64 rounded-2xl border border-slate-200/80 bg-white/95 p-2 shadow-xl backdrop-blur-md" align="end">
          <div className="px-3 py-3 mb-1">
            <p className="text-sm font-bold text-slate-900 truncate">{session.user?.name}</p>
            <p className="text-[10px] text-slate-400 truncate">{session.user?.email}</p>
          </div>
          <DropdownMenuSeparator className="bg-slate-50 mb-1" />
          <DropdownMenuItem className="cursor-pointer rounded-xl h-10 px-3 hover:bg-slate-50" onClick={() => window.location.href = "/dashboard/settings"}>
            <User className="mr-3 h-4 w-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-700">Account Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer rounded-xl h-10 px-3 hover:bg-slate-50" onClick={() => window.location.href = "/dashboard/settings"}>
            <Settings className="mr-3 h-4 w-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-700">Settings</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-slate-50 my-1" />
          <DropdownMenuItem 
            className="cursor-pointer rounded-xl h-10 px-3 text-red-600 hover:bg-red-50"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            <LogOut className="mr-3 h-4 w-4" />
            <span className="text-sm font-bold">Sign out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSession, signOut } from "next-auth/react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger, 
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, LogOut, LayoutDashboard, Settings } from "lucide-react";
import { getAuthAwarePath } from "@/lib/auth-redirect";

export function Navbar() {
  const { data: session, status } = useSession();
  const hasSession = Boolean(session);

  return (
    <header className="fixed left-1/2 top-6 z-50 w-[95%] max-w-5xl -translate-x-1/2 rounded-full border border-slate-200/75 bg-white/74 shadow-[0_10px_34px_rgba(15,23,42,0.07)] backdrop-blur-xl transition-all">
      <div className="flex h-14 items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="kivo-brand-badge flex aspect-square size-8 items-center justify-center rounded-lg text-lg font-bold text-white">
            K
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            Kivo
          </span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <Link href="/#features" className="hover:text-slate-900 transition-colors">Features</Link>
          <Link href="/#how-it-works" className="hover:text-slate-900 transition-colors">How it works</Link>
          <Link href="/#faq" className="hover:text-slate-900 transition-colors">FAQ</Link>
          <Link href="/#pricing" className="hover:text-slate-900 transition-colors">Pricing</Link>
        </nav>

        <div className="flex items-center gap-3">
          {status === "loading" ? (
            <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
          ) : session ? (
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="hidden sm:inline-flex text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                Dashboard
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger className="kivo-chip relative h-9 w-9 overflow-hidden rounded-full border p-0 outline-none transition-all">
                  <Avatar className="h-9 w-9 text-slate-900 border-none">
                    <AvatarImage src={session.user?.image || ""} alt={session.user?.name || ""} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-100 to-emerald-100 text-blue-800 font-medium">
                      {session.user?.name?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="mt-2 w-56 rounded-xl border border-slate-200/75 bg-white/95 backdrop-blur-md" align="end">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{session.user?.name}</p>
                      <p className="text-xs leading-none text-slate-500">{session.user?.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Link href="/dashboard" className="cursor-pointer flex items-center w-full">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                    onClick={() => signOut({ callbackUrl: "/" })}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <>
              <Button
                variant="ghost"
                className="hidden sm:inline-flex text-sm font-medium text-slate-600 hover:text-slate-900 rounded-full"
                onClick={() => {
                  window.location.href = getAuthAwarePath(hasSession, "/login");
                }}
              >
                Log in
              </Button>
              <Button className="kivo-primary-btn h-9 rounded-full px-5 text-sm" onClick={() => window.location.href = getAuthAwarePath(hasSession, "/login")}>
                Sign up
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

import { Sidebar } from "@/components/dashboard/Sidebar";
import { UserNav } from "@/components/dashboard/UserNav";
import { Search, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-dvh overflow-hidden bg-transparent p-3 md:p-5">
      <div className="kivo-surface flex h-full overflow-hidden rounded-[30px]">
        <Sidebar />

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-40 flex h-[72px] items-center justify-between border-b border-slate-200/70 bg-white/70 px-6 backdrop-blur-xl md:px-8">
            <div className="flex flex-1 items-center gap-4">
              <div className="relative hidden w-full max-w-md md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Quick search"
                  className="kivo-chip w-full rounded-xl border-none py-2.5 pl-10 pr-4 text-sm text-slate-600 outline-none transition-all focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="kivo-chip rounded-xl text-slate-500 hover:bg-white/95">
                <Bell className="h-5 w-5" />
              </Button>
              <div className="mx-1 h-8 w-px bg-slate-300/80" />
              <UserNav />
            </div>
          </header>

          <main className="min-h-0 flex-1 overflow-y-auto p-6 md:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

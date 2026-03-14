import { SignInButton } from "@/components/auth/SignInButton";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-200/50 rounded-full blur-3xl mix-blend-multiply opacity-70 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-200/50 rounded-full blur-3xl mix-blend-multiply opacity-70 pointer-events-none" />
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 mb-8 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to home
        </Link>

        <div className="flex justify-center mb-6">
          <div className="flex aspect-square size-12 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold text-2xl shadow-lg shadow-indigo-600/20">
            K
          </div>
        </div>
        <h2 className="mt-2 text-center text-3xl font-extrabold text-slate-900 tracking-tight">
          Welcome to Kivo
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          The multilingual feedback hub powered by Lingo.dev
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-10 px-4 shadow-xl shadow-slate-200/50 sm:rounded-2xl sm:px-10 border border-slate-100">
          <SignInButton />
        </div>
        <p className="mt-6 text-center text-xs text-slate-500">
          By signing in, you agree to our{" "}
          <Link href="/privacy" className="font-medium text-blue-700 hover:underline">
            Privacy Policy
          </Link>{" "}
          and{" "}
          <Link href="/cookies" className="font-medium text-blue-700 hover:underline">
            Cookie Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}

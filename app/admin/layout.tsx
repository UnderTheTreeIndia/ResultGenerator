import Link from "next/link";
import { LogoutButton } from "@/components/LogoutButton";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F4F1E8]">
      <header className="border-b border-utt-gold/30 bg-white/60 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <Link href="/admin" className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="UTT"
              className="h-9 w-9 object-contain"
              style={{ mixBlendMode: "multiply" }}
            />
            <div className="leading-tight">
              <div className="font-serif font-semibold text-utt-green">
                Under The Tree
              </div>
              <div className="text-[10px] uppercase tracking-widest text-gray-500">
                Result Cum Certificate
              </div>
            </div>
          </Link>
          <nav className="flex items-center gap-5 text-sm">
            <Link
              href="/admin"
              className="text-gray-700 hover:text-utt-green"
            >
              Dashboard
            </Link>
            <Link
              href="/admin/students"
              className="text-gray-700 hover:text-utt-green"
            >
              Students
            </Link>
            <LogoutButton />
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}

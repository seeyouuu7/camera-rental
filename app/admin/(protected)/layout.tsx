import Link from "next/link";
import { requireAdmin } from "@/lib/adminAuth";
import LogoutButton from "./LogoutButton";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="border-b border-zinc-800 bg-zinc-900">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-6">
            <span className="font-bold text-white">방광대여 관리자</span>
            <nav className="flex items-center gap-4 text-sm">
              <Link href="/admin" className="text-zinc-400 hover:text-white transition-colors">
                예약 현황
              </Link>
              <Link href="/admin/equipment" className="text-zinc-400 hover:text-white transition-colors">
                장비 관리
              </Link>
              <Link href="/admin/calendar" className="text-zinc-400 hover:text-white transition-colors">
                캘린더
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
              사이트 보기 →
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}

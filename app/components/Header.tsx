"use client";

import Link from "next/link";
import { useCart } from "@/app/context/CartContext";

export default function Header() {
  const { items, session } = useCart();
  const count = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="text-xl font-bold tracking-tight text-zinc-900">
          방광대여
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/reservation/lookup"
            className="hidden text-sm text-zinc-500 hover:text-zinc-800 transition-colors sm:block"
          >
            예약 확인
          </Link>
          {session ? (
            <span className="hidden text-sm text-zinc-500 sm:block">
              {session.startDate} ~ {session.endDate}
            </span>
          ) : (
            <Link
              href="/reservation/start"
              className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
            >
              예약 시작하기
            </Link>
          )}

          <Link href="/cart" className="relative flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium hover:bg-zinc-50 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            장바구니
            {count > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900 text-xs text-white">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}

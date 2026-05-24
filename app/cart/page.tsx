"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/app/context/CartContext";

function daysBetween(start: string, end: string) {
  return Math.max(1, Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / 86400000));
}

export default function CartPage() {
  const { session, items, removeItem, clearCart } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleReserve() {
    if (!session || items.length === 0) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          renterName: session.renterName,
          phone: session.phone,
          teamMembers: session.teamMembers,
          startDate: session.startDate,
          endDate: session.endDate,
          items: items.map((item) => ({
            equipmentId: item.equipmentId,
            quantity: item.quantity,
          })),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "예약 처리 중 오류가 발생했습니다.");
      }

      const { id } = await res.json();
      clearCart();
      router.push(`/reservation/complete?id=${id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  if (!session) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 text-center">
        <span className="text-5xl">🛒</span>
        <h2 className="mt-4 text-xl font-bold text-zinc-900">예약 정보가 없어요</h2>
        <p className="mt-2 text-sm text-zinc-500">먼저 예약 정보를 입력해주세요.</p>
        <Link
          href="/reservation/start"
          className="mt-6 rounded-xl bg-zinc-900 px-6 py-3 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
        >
          예약 시작하기
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 text-center">
        <span className="text-5xl">📦</span>
        <h2 className="mt-4 text-xl font-bold text-zinc-900">장바구니가 비어있어요</h2>
        <p className="mt-2 text-sm text-zinc-500">장비 목록에서 필요한 장비를 담아보세요.</p>
        <Link
          href="/"
          className="mt-6 rounded-xl bg-zinc-900 px-6 py-3 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
        >
          장비 보러가기
        </Link>
      </div>
    );
  }

  const days = daysBetween(session.startDate, session.endDate);

  return (
    <div className="min-h-screen bg-zinc-50">
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <h1 className="text-2xl font-bold text-zinc-900">장바구니 확인</h1>

        {/* 예약 정보 요약 */}
        <div className="mt-4 rounded-2xl border border-zinc-200 bg-white p-5">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">예약 정보</h2>
          <div className="mt-3 grid grid-cols-2 gap-y-2 text-sm">
            <span className="text-zinc-500">대여자</span>
            <span className="font-medium text-zinc-900">{session.renterName}</span>
            <span className="text-zinc-500">전화번호</span>
            <span className="font-medium text-zinc-900">{session.phone}</span>
            {session.teamMembers.length > 0 && (
              <>
                <span className="text-zinc-500">팀원</span>
                <span className="font-medium text-zinc-900">{session.teamMembers.join(", ")}</span>
              </>
            )}
            <span className="text-zinc-500">대여 기간</span>
            <span className="font-medium text-zinc-900">
              {session.startDate} ~ {session.endDate} ({days}일)
            </span>
          </div>
          <Link
            href="/reservation/start"
            className="mt-3 inline-block text-xs text-zinc-400 underline hover:text-zinc-600"
          >
            수정하기
          </Link>
        </div>

        {/* 장비 목록 */}
        <div className="mt-4 space-y-3">
          {items.map((item) => (
            <div
              key={item.equipmentId}
              className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-4"
            >
              <div className="relative h-16 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-zinc-100">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <span className="flex-1 font-medium text-zinc-900">{item.name}</span>
              <button
                onClick={() => removeItem(item.equipmentId)}
                className="text-zinc-300 hover:text-zinc-500 transition-colors text-xl leading-none"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        {/* 장비 추가 */}
        <Link
          href="/"
          className="mt-3 flex items-center justify-center gap-1.5 rounded-2xl border border-dashed border-zinc-300 py-3 text-sm text-zinc-400 hover:border-zinc-400 hover:text-zinc-600 transition-colors"
        >
          + 장비 추가하기
        </Link>

        {error && (
          <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
        )}

        <button
          onClick={handleReserve}
          disabled={loading}
          className="mt-6 w-full rounded-xl bg-zinc-900 py-4 text-base font-semibold text-white hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
        >
          {loading ? "예약 처리 중..." : "예약하기"}
        </button>
      </main>
    </div>
  );
}

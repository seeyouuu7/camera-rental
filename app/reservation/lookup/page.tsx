"use client";

import { useState } from "react";
import Link from "next/link";

type ReservationItem = { id: string; equipment: { name: string } };
type Reservation = {
  id: string;
  renterName: string;
  phone: string;
  teamMembers: string[];
  startDate: string;
  endDate: string;
  status: string;
  createdAt: string;
  items: ReservationItem[];
};

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  PENDING:   { label: "대기",    className: "bg-amber-100 text-amber-700" },
  CONFIRMED: { label: "확정",    className: "bg-emerald-100 text-emerald-700" },
  IN_USE:    { label: "사용 중", className: "bg-blue-100 text-blue-700" },
  RETURNED:  { label: "반납됨",  className: "bg-zinc-100 text-zinc-600" },
  COMPLETED: { label: "완료",    className: "bg-zinc-100 text-zinc-600" },
  CANCELLED: { label: "취소됨",  className: "bg-red-100 text-red-600" },
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("ko-KR");
}

function daysBetween(start: string, end: string) {
  return Math.max(1, Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / 86400000));
}

export default function LookupPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState<Reservation[] | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    setLoading(true);
    setError("");
    setResults(null);

    try {
      const res = await fetch(
        `/api/reservations/lookup?name=${encodeURIComponent(name.trim())}&phone=${encodeURIComponent(phone.trim())}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "조회 실패");
      setResults(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-zinc-900">예약 확인</h1>
          <p className="mt-1 text-sm text-zinc-500">예약 시 입력한 이름과 전화번호로 조회하세요.</p>
        </div>

        <form
          onSubmit={handleSearch}
          className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-700">대여자 이름</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="홍길동"
                className="w-full rounded-xl border border-zinc-300 px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-700">전화번호</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="010-1234-5678"
                className="w-full rounded-xl border border-zinc-300 px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition"
              />
            </div>
          </div>
          {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={loading || !name.trim() || !phone.trim()}
            className="mt-4 w-full rounded-xl bg-zinc-900 py-3 text-sm font-semibold text-white hover:bg-zinc-700 disabled:opacity-40 transition-colors"
          >
            {loading ? "조회 중..." : "조회하기"}
          </button>
        </form>

        {results !== null && (
          <div className="mt-6">
            {results.length === 0 ? (
              <div className="rounded-2xl border border-zinc-200 bg-white py-16 text-center text-zinc-500 shadow-sm">
                일치하는 예약이 없습니다.
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-zinc-500">총 {results.length}건의 예약을 찾았습니다.</p>
                {results.map((r) => {
                  const st = STATUS_LABEL[r.status] ?? STATUS_LABEL.PENDING;
                  const days = daysBetween(r.startDate, r.endDate);
                  return (
                    <div
                      key={r.id}
                      className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-zinc-900">{r.renterName}</p>
                          <p className="mt-0.5 text-xs text-zinc-400 font-mono">{r.id}</p>
                        </div>
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${st.className}`}>
                          {st.label}
                        </span>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-y-2 text-sm">
                        <span className="text-zinc-500">대여 기간</span>
                        <span className="text-zinc-800">
                          {formatDate(r.startDate)} ~ {formatDate(r.endDate)}{" "}
                          <span className="text-zinc-400">({days}일)</span>
                        </span>
                        {r.teamMembers.length > 0 && (
                          <>
                            <span className="text-zinc-500">팀원</span>
                            <span className="text-zinc-800">{r.teamMembers.join(", ")}</span>
                          </>
                        )}
                        <span className="text-zinc-500">장비</span>
                        <span className="text-zinc-800">
                          {r.items.map((i) => i.equipment.name).join(", ")}
                        </span>
                        <span className="text-zinc-500">예약일</span>
                        <span className="text-zinc-400 text-xs">{formatDate(r.createdAt)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link href="/" className="text-sm text-zinc-400 hover:text-zinc-600 transition-colors">
            ← 홈으로
          </Link>
        </div>
      </main>
    </div>
  );
}

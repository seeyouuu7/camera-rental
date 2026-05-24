"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Reservation, ReservationItem } from "@/app/generated/prisma/client";

type ItemWithEquipment = ReservationItem & {
  equipment: { name: string; category: { name: string } };
};
type ReservationWithItems = Reservation & { items: ItemWithEquipment[] };

const STATUS_STYLE: Record<string, { label: string; className: string }> = {
  PENDING:   { label: "대기",    className: "bg-amber-500/20 text-amber-400" },
  CONFIRMED: { label: "확정",    className: "bg-emerald-500/20 text-emerald-400" },
  IN_USE:    { label: "사용 중", className: "bg-blue-500/20 text-blue-400" },
  RETURNED:  { label: "반납됨",  className: "bg-zinc-500/20 text-zinc-400" },
  COMPLETED: { label: "완료",    className: "bg-zinc-500/20 text-zinc-400" },
  CANCELLED: { label: "취소됨",  className: "bg-red-500/20 text-red-400" },
};

const NEXT_STATUS: Record<string, { label: string; next: string; className: string } | null> = {
  PENDING:   { next: "CONFIRMED", label: "확정",    className: "border-emerald-800 text-emerald-400 hover:bg-emerald-900/30" },
  CONFIRMED: { next: "RETURNED",  label: "반납완료", className: "border-blue-800 text-blue-400 hover:bg-blue-900/30" },
  IN_USE:    { next: "RETURNED",  label: "반납완료", className: "border-blue-800 text-blue-400 hover:bg-blue-900/30" },
  RETURNED:  null,
  COMPLETED: null,
  CANCELLED: null,
};

export default function ReservationTable({ reservations }: { reservations: ReservationWithItems[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [action, setAction] = useState<string | null>(null);

  async function handleStatus(id: string, status: string, confirmMsg?: string) {
    if (confirmMsg && !confirm(confirmMsg)) return;
    setLoadingId(id);
    setAction(status);
    try {
      const res = await fetch(`/api/admin/reservations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      startTransition(() => router.refresh());
    } catch {
      alert("처리 중 오류가 발생했습니다.");
    } finally {
      setLoadingId(null);
      setAction(null);
    }
  }

  if (reservations.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 py-20 text-center text-zinc-500">
        예약 내역이 없습니다.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-800">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-800 bg-zinc-900 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">
            <th className="px-4 py-3">대여자</th>
            <th className="px-4 py-3">전화번호</th>
            <th className="px-4 py-3">팀원</th>
            <th className="px-4 py-3">장비</th>
            <th className="px-4 py-3">기간</th>
            <th className="px-4 py-3">상태</th>
            <th className="px-4 py-3">예약일</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800 bg-zinc-900">
          {reservations.map((r) => {
            const st = STATUS_STYLE[r.status] ?? STATUS_STYLE.PENDING;
            const nextAction = NEXT_STATUS[r.status] ?? null;
            const isLoading = loadingId === r.id;
            const days = Math.max(1, Math.ceil(
              (new Date(r.endDate).getTime() - new Date(r.startDate).getTime()) / 86400000
            ));
            return (
              <tr key={r.id} className="hover:bg-zinc-800/50 transition-colors">
                <td className="px-4 py-3 font-medium text-white">{r.renterName}</td>
                <td className="px-4 py-3 text-zinc-300">{r.phone}</td>
                <td className="px-4 py-3 text-zinc-400">
                  {r.teamMembers.length > 0 ? r.teamMembers.join(", ") : "—"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {r.items.map((item) => (
                      <span
                        key={item.id}
                        className="rounded-md bg-zinc-800 px-2 py-0.5 text-xs text-zinc-300"
                      >
                        {item.equipment.name}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-zinc-300 whitespace-nowrap">
                  {new Date(r.startDate).toLocaleDateString("ko-KR")} ~{" "}
                  {new Date(r.endDate).toLocaleDateString("ko-KR")}
                  <span className="ml-1 text-xs text-zinc-500">({days}일)</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${st.className}`}>
                    {st.label}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-zinc-500 whitespace-nowrap">
                  {new Date(r.createdAt).toLocaleDateString("ko-KR")}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    {nextAction && (
                      <button
                        onClick={() => handleStatus(r.id, nextAction.next)}
                        disabled={isLoading || pending}
                        className={`rounded-lg border px-2.5 py-1 text-xs disabled:opacity-40 transition-colors ${nextAction.className}`}
                      >
                        {isLoading && action === nextAction.next ? "처리 중..." : nextAction.label}
                      </button>
                    )}
                    {r.status !== "CANCELLED" && r.status !== "COMPLETED" && r.status !== "RETURNED" && (
                      <button
                        onClick={() => handleStatus(r.id, "CANCELLED", "이 예약을 취소하시겠습니까?")}
                        disabled={isLoading || pending}
                        className="rounded-lg border border-red-800 px-2.5 py-1 text-xs text-red-400 hover:bg-red-900/30 disabled:opacity-40 transition-colors"
                      >
                        {isLoading && action === "CANCELLED" ? "처리 중..." : "취소"}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

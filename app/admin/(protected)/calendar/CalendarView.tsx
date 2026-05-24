"use client";

import { useState, useEffect } from "react";

type ReservationItem = { equipment: { name: string } };
type Reservation = {
  id: string;
  renterName: string;
  startDate: string;
  endDate: string;
  status: string;
  items: ReservationItem[];
};

const STATUS_COLOR: Record<string, string> = {
  PENDING:   "bg-amber-500/30 text-amber-300 border-amber-700/50",
  CONFIRMED: "bg-emerald-500/30 text-emerald-300 border-emerald-700/50",
  IN_USE:    "bg-blue-500/30 text-blue-300 border-blue-700/50",
  RETURNED:  "bg-zinc-500/30 text-zinc-400 border-zinc-700/50",
  COMPLETED: "bg-zinc-500/30 text-zinc-400 border-zinc-700/50",
};

const DAYS_KO = ["일", "월", "화", "수", "목", "금", "토"];

function isoDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function buildDayMap(reservations: Reservation[], year: number, month: number) {
  const map: Record<string, Reservation[]> = {};
  const daysInMonth = new Date(year, month, 0).getDate();

  for (let d = 1; d <= daysInMonth; d++) {
    const key = isoDate(new Date(year, month - 1, d));
    map[key] = [];
  }

  for (const r of reservations) {
    const start = new Date(r.startDate);
    const end = new Date(r.endDate);
    const cur = new Date(start);
    while (cur <= end) {
      const key = isoDate(cur);
      if (map[key]) map[key].push(r);
      cur.setDate(cur.getDate() + 1);
    }
  }

  return map;
}

export default function CalendarView({ initialYear, initialMonth }: { initialYear: number; initialMonth: number }) {
  const [year, setYear] = useState(initialYear);
  const [month, setMonth] = useState(initialMonth);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/reservations/calendar?year=${year}&month=${month}`)
      .then((r) => r.json())
      .then((data) => { setReservations(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [year, month]);

  function prevMonth() {
    if (month === 1) { setYear(y => y - 1); setMonth(12); }
    else setMonth(m => m - 1);
  }

  function nextMonth() {
    if (month === 12) { setYear(y => y + 1); setMonth(1); }
    else setMonth(m => m + 1);
  }

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDay = new Date(year, month - 1, 1).getDay();
  const dayMap = buildDayMap(reservations, year, month);
  const today = isoDate(new Date());

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div>
      {/* Month navigator */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-400 hover:border-zinc-500 hover:text-white transition-colors"
        >
          ← 이전
        </button>
        <h2 className="text-lg font-semibold text-white">
          {year}년 {month}월
        </h2>
        <button
          onClick={nextMonth}
          className="rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-400 hover:border-zinc-500 hover:text-white transition-colors"
        >
          다음 →
        </button>
      </div>

      {/* Legend */}
      <div className="mb-4 flex flex-wrap gap-3 text-xs">
        {Object.entries({
          PENDING: "대기",
          CONFIRMED: "확정",
          IN_USE: "사용 중",
          RETURNED: "반납됨",
        }).map(([key, label]) => (
          <span key={key} className={`rounded-md border px-2 py-0.5 ${STATUS_COLOR[key]}`}>
            {label}
          </span>
        ))}
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS_KO.map((d, i) => (
          <div
            key={d}
            className={`py-2 text-center text-xs font-semibold ${i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : "text-zinc-500"}`}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      {loading ? (
        <div className="py-20 text-center text-zinc-500">불러오는 중...</div>
      ) : (
        <div className="grid grid-cols-7 gap-px bg-zinc-800 rounded-2xl overflow-hidden border border-zinc-800">
          {cells.map((day, idx) => {
            if (day === null) {
              return <div key={`empty-${idx}`} className="bg-zinc-950 min-h-[100px]" />;
            }
            const key = isoDate(new Date(year, month - 1, day));
            const dayReservations = dayMap[key] ?? [];
            const isToday = key === today;
            const dow = (firstDay + day - 1) % 7;

            return (
              <div
                key={key}
                className={`bg-zinc-900 p-1.5 min-h-[100px] ${isToday ? "ring-1 ring-inset ring-white/20" : ""}`}
              >
                <div
                  className={`mb-1 flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                    isToday
                      ? "bg-white text-zinc-900"
                      : dow === 0
                      ? "text-red-400"
                      : dow === 6
                      ? "text-blue-400"
                      : "text-zinc-400"
                  }`}
                >
                  {day}
                </div>
                <div className="space-y-0.5">
                  {dayReservations.map((r) => {
                    const colorClass = STATUS_COLOR[r.status] ?? STATUS_COLOR.PENDING;
                    const equipNames = r.items.map((i) => i.equipment.name).join(", ");
                    return (
                      <div
                        key={r.id}
                        className={`rounded border px-1 py-0.5 text-[10px] leading-tight truncate ${colorClass}`}
                        title={`${r.renterName} — ${equipNames}`}
                      >
                        <span className="font-medium">{r.renterName}</span>
                        <span className="ml-1 opacity-70">{equipNames}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

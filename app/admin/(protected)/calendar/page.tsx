import CalendarView from "./CalendarView";

export const dynamic = "force-dynamic";

export default function CalendarPage() {
  const now = new Date();
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">예약 캘린더</h1>
        <p className="mt-1 text-sm text-zinc-400">장비별 예약 현황을 월별로 확인하세요.</p>
      </div>
      <CalendarView initialYear={now.getFullYear()} initialMonth={now.getMonth() + 1} />
    </div>
  );
}

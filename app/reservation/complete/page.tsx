import Link from "next/link";
import { prisma } from "@/lib/prisma";

type SearchParams = Promise<{ id?: string }>;

export default async function CompletePage({ searchParams }: { searchParams: SearchParams }) {
  const { id } = await searchParams;

  const reservation = id
    ? await prisma.reservation.findUnique({
        where: { id },
        include: {
          items: { include: { equipment: { select: { name: true } } } },
        },
      })
    : null;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <svg className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="mt-4 text-2xl font-bold text-zinc-900">예약이 완료됐습니다!</h1>

        {reservation && (
          <div className="mt-6 rounded-xl bg-zinc-50 p-4 text-left text-sm">
            <div className="grid grid-cols-2 gap-y-2">
              <span className="text-zinc-500">예약 번호</span>
              <span className="font-mono text-xs text-zinc-700 truncate">{reservation.id}</span>
              <span className="text-zinc-500">대여자</span>
              <span className="font-medium text-zinc-900">{reservation.renterName}</span>
              <span className="text-zinc-500">전화번호</span>
              <span className="font-medium text-zinc-900">{reservation.phone}</span>
              <span className="text-zinc-500">기간</span>
              <span className="text-zinc-900">
                {reservation.startDate.toLocaleDateString("ko-KR")} ~{" "}
                {reservation.endDate.toLocaleDateString("ko-KR")}
              </span>
              <span className="text-zinc-500">장비</span>
              <span className="text-zinc-900">
                {reservation.items.map((i) => i.equipment.name).join(", ")}
              </span>
            </div>
          </div>
        )}

        <p className="mt-4 text-sm text-zinc-500">
          예약 확인 후 담당자가 연락드릴 예정입니다.
        </p>

        <Link
          href="/"
          className="mt-6 inline-block w-full rounded-xl bg-zinc-900 py-3 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
        >
          홈으로 돌아가기
        </Link>
        <Link
          href="/reservation/lookup"
          className="mt-2 inline-block w-full rounded-xl border border-zinc-200 py-3 text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition-colors"
        >
          예약 조회하기
        </Link>
      </div>
    </div>
  );
}

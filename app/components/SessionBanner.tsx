"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCart } from "@/app/context/CartContext";

export default function SessionBanner() {
  const { session } = useCart();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 홈페이지에서 세션 날짜를 URL 파라미터로 동기화
  useEffect(() => {
    if (!session || pathname !== "/") return;
    const currentStart = searchParams.get("start");
    const currentEnd = searchParams.get("end");
    if (currentStart === session.startDate && currentEnd === session.endDate) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set("start", session.startDate);
    params.set("end", session.endDate);
    router.replace(`/?${params.toString()}`);
  }, [session, pathname, searchParams, router]);

  if (session) {
    return (
      <div className="border-b border-emerald-100 bg-emerald-50 px-4 py-2.5">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 text-sm sm:px-6">
          <span className="text-emerald-700">
            <span className="font-semibold">{session.renterName}</span>님 ·{" "}
            {session.startDate} ~ {session.endDate}
            {session.teamMembers.length > 0 && (
              <span className="ml-2 text-emerald-600">
                · 팀원: {session.teamMembers.join(", ")}
              </span>
            )}
          </span>
          <Link
            href="/reservation/start"
            className="text-xs text-emerald-600 underline hover:text-emerald-800"
          >
            수정
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="border-b border-amber-100 bg-amber-50 px-4 py-2.5">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 text-sm sm:px-6">
        <span className="text-amber-700">
          장비를 담으려면 먼저 예약 정보를 입력해주세요.
        </span>
        <Link
          href="/reservation/start"
          className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-600 transition-colors"
        >
          시작하기
        </Link>
      </div>
    </div>
  );
}

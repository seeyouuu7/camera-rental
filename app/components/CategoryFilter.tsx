"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { Category } from "@/app/generated/prisma/client";

export default function CategoryFilter({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = searchParams.get("category") ?? "all";

  function select(slug: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (slug === "all") {
      params.delete("category");
    } else {
      params.set("category", slug);
    }
    // start/end 날짜 파라미터는 유지
    router.push(`/?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => select("all")}
        className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
          active === "all"
            ? "bg-zinc-900 text-white"
            : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
        }`}
      >
        전체
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => select(cat.slug)}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            active === cat.slug
              ? "bg-zinc-900 text-white"
              : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
          }`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}

import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import type { Equipment, Category } from "@/app/generated/prisma/client";
import EquipmentCard from "@/app/components/EquipmentCard";
import CategoryFilter from "@/app/components/CategoryFilter";
import SessionBanner from "@/app/components/SessionBanner";

type EquipmentWithCategory = Equipment & { category: Category };

type SearchParams = Promise<{ category?: string; start?: string; end?: string }>;

async function getPageData(categorySlug?: string, startDate?: string, endDate?: string) {
  const categories = await prisma.category.findMany({ orderBy: { sortOrder: "asc" } });

  const equipment = await prisma.equipment.findMany({
    where: categorySlug ? { category: { slug: categorySlug } } : {},
    include: { category: true },
    orderBy: { category: { sortOrder: "asc" } },
  });

  let bookedMap: Record<string, number> = {};
  if (startDate && endDate) {
    const items = await prisma.reservationItem.findMany({
      where: {
        reservation: {
          status: { in: ["CONFIRMED", "IN_USE", "PENDING"] },
          startDate: { lte: new Date(endDate) },
          endDate: { gte: new Date(startDate) },
        },
      },
      select: { equipmentId: true, quantity: true },
    });
    items.forEach(({ equipmentId, quantity }) => {
      bookedMap[equipmentId] = (bookedMap[equipmentId] ?? 0) + quantity;
    });
  }

  return { categories, equipment, bookedMap };
}

export default async function HomePage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const { categories, equipment, bookedMap } = await getPageData(
    params.category,
    params.start,
    params.end,
  );

  return (
    <div className="min-h-screen bg-zinc-50">
      <Suspense fallback={null}>
        <SessionBanner />
      </Suspense>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900">촬영장비 대여</h1>
          <p className="mt-1 text-zinc-500">필요한 장비를 골라 장바구니에 담으세요.</p>
        </div>

        <div className="mb-6">
          <Suspense fallback={null}>
            <CategoryFilter categories={categories} />
          </Suspense>
        </div>

        {equipment.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-zinc-400">
            <span className="text-4xl">📦</span>
            <p className="mt-3 text-sm">해당 카테고리에 장비가 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {(equipment as EquipmentWithCategory[]).map((item) => (
              <EquipmentCard
                key={item.id}
                item={item}
                bookedQuantity={bookedMap[item.id] ?? 0}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

import { prisma } from "@/lib/prisma";
import type { Equipment, Category } from "@/app/generated/prisma/client";
import EquipmentManager from "./EquipmentManager";

type EquipmentWithCategory = Equipment & { category: { id: string; name: string } };

export const dynamic = "force-dynamic";

export default async function AdminEquipmentPage() {
  const [equipment, categories] = await Promise.all([
    prisma.equipment.findMany({
      include: { category: { select: { id: true, name: true } } },
      orderBy: [{ category: { name: "asc" } }, { name: "asc" }],
    }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">장비 관리</h1>
          <p className="mt-1 text-sm text-zinc-400">총 {equipment.length}개</p>
        </div>
      </div>
      <EquipmentManager equipment={equipment as EquipmentWithCategory[]} categories={categories as Category[]} />
    </div>
  );
}

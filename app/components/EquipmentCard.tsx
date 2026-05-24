"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/app/context/CartContext";
import type { Equipment, Category } from "@/app/generated/prisma/client";

type Props = {
  item: Equipment & { category: Category };
  bookedQuantity: number;
};

export default function EquipmentCard({ item, bookedQuantity }: Props) {
  const { items, addItem, removeItem, session } = useCart();
  const inCart = items.some((i) => i.equipmentId === item.id);
  const broken = item.status === "MAINTENANCE";
  const available = item.stock - bookedQuantity;
  const soldOut = broken || available <= 0;

  const thumbnail =
    item.images[0] ?? "https://placehold.co/600x400/e5e7eb/9ca3af?text=No+Image";

  function handleToggle() {
    if (!session) return;
    if (inCart) {
      removeItem(item.id);
    } else {
      addItem({
        equipmentId: item.id,
        name: item.name,
        image: thumbnail,
        dailyPrice: 0,
        deposit: 0,
      });
    }
  }

  return (
    <div className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-100">
        <Image
          src={thumbnail}
          alt={item.name}
          fill
          className={`object-cover transition-transform duration-300 group-hover:scale-105 ${soldOut ? "grayscale opacity-60" : ""}`}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          unoptimized
        />
        {soldOut && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-zinc-700">
              {broken ? "대여 불가" : "품절"}
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <span className="text-xs font-medium text-zinc-400">{item.category.name}</span>
        <h3 className="mt-0.5 font-semibold text-zinc-900 leading-snug">{item.name}</h3>

        <div className="mt-3 flex items-center justify-end">
          {!session ? (
            <Link
              href="/reservation/start"
              className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-500 hover:bg-zinc-50 transition-colors"
            >
              예약 먼저
            </Link>
          ) : soldOut ? (
            <span className="rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-400">
              {broken ? "대여 불가" : "품절"}
            </span>
          ) : inCart ? (
            <button
              onClick={handleToggle}
              className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-700 transition-colors"
            >
              담김 ✓
            </button>
          ) : (
            <button
              onClick={handleToggle}
              className="rounded-lg border border-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-900 hover:bg-zinc-900 hover:text-white transition-colors"
            >
              담기
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

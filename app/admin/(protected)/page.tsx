import { prisma } from "@/lib/prisma";
import ReservationTable from "./ReservationTable";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const reservations = await prisma.reservation.findMany({
    include: {
      items: {
        include: { equipment: { select: { name: true, category: { select: { name: true } } } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">예약 현황</h1>
          <p className="mt-1 text-sm text-zinc-400">총 {reservations.length}건</p>
        </div>
      </div>
      <ReservationTable reservations={reservations} />
    </div>
  );
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const year = parseInt(searchParams.get("year") ?? String(new Date().getFullYear()), 10);
  const month = parseInt(searchParams.get("month") ?? String(new Date().getMonth() + 1), 10);

  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);

  const reservations = await prisma.reservation.findMany({
    where: {
      status: { notIn: ["CANCELLED"] },
      startDate: { lte: end },
      endDate: { gte: start },
    },
    include: {
      items: { include: { equipment: { select: { name: true } } } },
    },
    orderBy: { startDate: "asc" },
  });

  return NextResponse.json(reservations);
}

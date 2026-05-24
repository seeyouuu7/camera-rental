import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const name = searchParams.get("name")?.trim();
  const phone = searchParams.get("phone")?.trim();

  if (!name || !phone) {
    return NextResponse.json({ error: "이름과 전화번호를 입력해주세요." }, { status: 400 });
  }

  const reservations = await prisma.reservation.findMany({
    where: { renterName: name, phone },
    include: {
      items: {
        include: { equipment: { select: { name: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(reservations);
}

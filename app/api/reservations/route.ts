import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type ItemInput = {
  equipmentId: string;
  quantity: number;
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { renterName, phone, teamMembers, startDate, endDate, items } = body as {
      renterName: string;
      phone: string;
      teamMembers: string[];
      startDate: string;
      endDate: string;
      items: ItemInput[];
    };

    if (!renterName || !phone || !startDate || !endDate || !items?.length) {
      return NextResponse.json({ error: "필수 정보가 누락되었습니다." }, { status: 400 });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 86400000));

    // 재고 확인
    for (const item of items) {
      const equipment = await prisma.equipment.findUnique({
        where: { id: item.equipmentId },
        select: { id: true, stock: true, status: true },
      });
      if (!equipment || equipment.status === "DISCONTINUED") {
        return NextResponse.json({ error: "존재하지 않는 장비입니다." }, { status: 400 });
      }

      const booked = await prisma.reservationItem.aggregate({
        _sum: { quantity: true },
        where: {
          equipmentId: item.equipmentId,
          reservation: {
            status: { in: ["CONFIRMED", "IN_USE", "PENDING"] },
            startDate: { lte: end },
            endDate: { gte: start },
          },
        },
      });
      const available = equipment.stock - (booked._sum.quantity ?? 0);
      if (available < item.quantity) {
        return NextResponse.json(
          { error: `재고가 부족합니다. (가용 수량: ${available})` },
          { status: 409 }
        );
      }
    }

    const reservation = await prisma.reservation.create({
      data: {
        renterName,
        phone,
        teamMembers,
        startDate: start,
        endDate: end,
        totalPrice: 0,
        items: {
          create: items.map((item) => ({
            equipmentId: item.equipmentId,
            quantity: item.quantity,
            dailyPrice: 0,
            days,
            subtotal: 0,
          })),
        },
      },
      select: { id: true },
    });

    return NextResponse.json({ id: reservation.id }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

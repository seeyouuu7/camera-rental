import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/adminAuth";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const equipment = await prisma.equipment.findMany({
    include: { category: { select: { id: true, name: true } } },
    orderBy: [{ category: { name: "asc" } }, { name: "asc" }],
  });

  return NextResponse.json(equipment);
}

export async function POST(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, categoryId, stock } = body;

  if (!name || !categoryId) {
    return NextResponse.json({ error: "name and categoryId are required" }, { status: 400 });
  }

  const equipment = await prisma.equipment.create({
    data: {
      name,
      categoryId,
      stock: stock ?? 1,
      dailyPrice: 0,
      deposit: 0,
    },
    include: { category: { select: { id: true, name: true } } },
  });

  return NextResponse.json(equipment, { status: 201 });
}

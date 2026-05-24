import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/adminAuth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { name, categoryId, stock } = body;

  if (!name || !categoryId) {
    return NextResponse.json({ error: "name and categoryId are required" }, { status: 400 });
  }

  const equipment = await prisma.equipment.update({
    where: { id },
    data: { name, categoryId, stock: stock ?? 1 },
    include: { category: { select: { id: true, name: true } } },
  });

  return NextResponse.json(equipment);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { status } = await request.json();

  const validStatuses = ["AVAILABLE", "RENTED", "MAINTENANCE", "DISCONTINUED"];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const equipment = await prisma.equipment.update({
    where: { id },
    data: { status },
    include: { category: { select: { id: true, name: true } } },
  });

  return NextResponse.json(equipment);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  await prisma.equipment.delete({ where: { id } });

  return new NextResponse(null, { status: 204 });
}

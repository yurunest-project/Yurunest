import { auth } from "@/auth";
import {
  createAvailabilitySlots,
  listAvailabilitySlots,
} from "@/lib/availability";
import { parseJstDateTime } from "@/lib/datetime";
import { prisma } from "@/lib/prisma";
import { AvailabilitySlotStatus } from "@prisma/client";
import { NextResponse } from "next/server";

async function requireAdmin() {
  const session = await auth();
  return session?.user?.role === "ADMIN";
}

export async function GET(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date")?.trim() ?? "";
  const employeeId = searchParams.get("employeeId")?.trim() || undefined;
  if (!date) {
    return NextResponse.json({ error: "Date is required" }, { status: 400 });
  }

  try {
    const startAt = parseJstDateTime(date, "00:00");
    const endAt = new Date(startAt.getTime() + 24 * 60 * 60 * 1000);
    const slots = await listAvailabilitySlots({ employeeId, startAt, endAt });
    return NextResponse.json({
      slots: slots.map((slot) => ({
        id: slot.id,
        employeeId: slot.employeeId,
        employeeName: slot.employee.name,
        startAt: slot.startAt.toISOString(),
        status: slot.status,
      })),
    });
  } catch {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: {
    employeeId?: string;
    date?: string;
    startTime?: string;
    endTime?: string;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.employeeId || !body.date || !body.startTime || !body.endTime) {
    return NextResponse.json({ error: "スタッフ・日付・時間帯を入力してください" }, { status: 400 });
  }

  try {
    const result = await createAvailabilitySlots({
      employeeId: body.employeeId,
      date: body.date,
      startTime: body.startTime,
      endTime: body.endTime,
    });
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "シフトを作成できませんでした";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: { slotId?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.slotId) {
    return NextResponse.json({ error: "Slot ID is required" }, { status: 400 });
  }

  const result = await prisma.employeeAvailabilitySlot.deleteMany({
    where: { id: body.slotId, status: AvailabilitySlotStatus.open },
  });
  if (result.count === 0) {
    return NextResponse.json(
      { error: "予約済みまたは存在しない枠は削除できません" },
      { status: 400 },
    );
  }
  return NextResponse.json({ ok: true });
}

import { auth } from "@/auth";
import {
  createAvailabilitySlots,
  listAvailabilitySlots,
} from "@/lib/availability";
import { parseJstDateTime } from "@/lib/datetime";
import { prisma } from "@/lib/prisma";
import { AvailabilitySlotStatus } from "@prisma/client";
import { NextResponse } from "next/server";

async function employeeId() {
  const session = await auth();
  return session?.user?.role === "EMPLOYEE"
    ? session.user.employeeId
    : undefined;
}

export async function GET(request: Request) {
  const id = await employeeId();
  if (!id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const date = new URL(request.url).searchParams.get("date")?.trim() ?? "";
  if (!date) {
    return NextResponse.json({ error: "Date is required" }, { status: 400 });
  }

  try {
    const startAt = parseJstDateTime(date, "00:00");
    const endAt = new Date(startAt.getTime() + 24 * 60 * 60 * 1000);
    const slots = await listAvailabilitySlots({
      employeeId: id,
      startAt,
      endAt,
    });
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
  const id = await employeeId();
  if (!id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let body: { date?: string; startTime?: string; endTime?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!body.date || !body.startTime || !body.endTime) {
    return NextResponse.json(
      { error: "日付・時間帯を入力してください" },
      { status: 400 },
    );
  }

  try {
    const result = await createAvailabilitySlots({
      employeeId: id,
      date: body.date,
      startTime: body.startTime,
      endTime: body.endTime,
    });
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "シフトを作成できませんでした",
      },
      { status: 400 },
    );
  }
}

export async function DELETE(request: Request) {
  const id = await employeeId();
  if (!id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

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
    where: {
      id: body.slotId,
      employeeId: id,
      status: AvailabilitySlotStatus.open,
    },
  });
  if (result.count === 0) {
    return NextResponse.json(
      { error: "予約済みまたは存在しない枠は削除できません" },
      { status: 400 },
    );
  }
  return NextResponse.json({ ok: true });
}

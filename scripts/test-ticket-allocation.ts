import assert from "node:assert/strict";
import { TicketKind } from "@prisma/client";
import {
  decomposeMinutes,
  selectBestTickets,
} from "../src/lib/ticket-allocation";

function ticket(id: string, minutes: number, ageMinutes: number) {
  const kind =
    minutes === 300
      ? TicketKind.sleep5
      : minutes === 180
        ? TicketKind.hour3
        : minutes === 60
          ? TicketKind.hour1
          : minutes === 30
            ? TicketKind.min30
            : TicketKind.min15;
  return {
    id,
    minutes,
    kind,
    createdAt: new Date(Date.now() - ageMinutes * 60_000),
  };
}

assert.deepEqual(
  selectBestTickets([ticket("exact", 30, 1), ticket("long", 60, 2)], 30).map(
    (item) => item.id,
  ),
  ["exact"],
  "完全一致を優先する",
);

assert.deepEqual(
  selectBestTickets([ticket("long", 60, 1), ticket("short", 15, 2)], 30).map(
    (item) => item.id,
  ),
  ["long"],
  "最短の長時間券を優先する",
);

assert.deepEqual(
  selectBestTickets(
    [
      ticket("old30", 30, 10),
      ticket("new30", 30, 1),
      ticket("min15", 15, 5),
    ],
    60,
  ).map((item) => item.id),
  ["old30", "new30"],
  "組合せは最小枚数かつFIFOにする",
);

assert.deepEqual(decomposeMinutes(15), ["min15"]);
assert.deepEqual(decomposeMinutes(150), ["hour1", "hour1", "min30"]);
assert.deepEqual(decomposeMinutes(285), [
  "hour3",
  "hour1",
  "min30",
  "min15",
]);
assert.deepEqual(decomposeMinutes(480), ["sleep5", "hour3"]);

console.log("OK — ticket allocation rules work.");

-- AlterTable: Reservation loses ticketId, gains durationMinutes; Ticket gains reservationId

ALTER TABLE "Reservation" DROP CONSTRAINT IF EXISTS "Reservation_ticketId_fkey";

DROP INDEX IF EXISTS "Reservation_ticketId_key";

ALTER TABLE "Reservation" DROP COLUMN IF EXISTS "ticketId";

ALTER TABLE "Reservation" ADD COLUMN IF NOT EXISTS "durationMinutes" INTEGER NOT NULL DEFAULT 15;

ALTER TABLE "Ticket" ADD COLUMN IF NOT EXISTS "reservationId" TEXT;

CREATE INDEX IF NOT EXISTS "Ticket_reservationId_idx" ON "Ticket"("reservationId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Ticket_reservationId_fkey'
  ) THEN
    ALTER TABLE "Ticket"
      ADD CONSTRAINT "Ticket_reservationId_fkey"
      FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

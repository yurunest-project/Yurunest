-- CreateEnum
CREATE TYPE "TicketKind" AS ENUM ('min15', 'min30', 'hour1', 'hour3', 'sleep5');

-- CreateEnum
CREATE TYPE "TicketSource" AS ENUM ('purchase', 'change', 'admin');

-- AlterEnum
ALTER TYPE "TicketStatus" ADD VALUE 'voided';

-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "issuedByReservationId" TEXT,
ADD COLUMN     "kind" "TicketKind" NOT NULL DEFAULT 'min15',
ADD COLUMN     "minutes" INTEGER NOT NULL DEFAULT 15,
ADD COLUMN     "parentTicketId" TEXT,
ADD COLUMN     "source" "TicketSource" NOT NULL DEFAULT 'purchase';

-- CreateTable
CREATE TABLE "TicketChangeLog" (
    "id" TEXT NOT NULL,
    "consumedTicketId" TEXT NOT NULL,
    "reservationId" TEXT NOT NULL,
    "usedMinutes" INTEGER NOT NULL,
    "returnedMinutes" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TicketChangeLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefundHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stripePaymentIntentId" TEXT NOT NULL,
    "stripeRefundId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "amount" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefundHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TicketChangeLog_reservationId_idx" ON "TicketChangeLog"("reservationId");

-- CreateIndex
CREATE INDEX "TicketChangeLog_consumedTicketId_idx" ON "TicketChangeLog"("consumedTicketId");

-- CreateIndex
CREATE UNIQUE INDEX "RefundHistory_stripeRefundId_key" ON "RefundHistory"("stripeRefundId");

-- CreateIndex
CREATE INDEX "RefundHistory_userId_createdAt_idx" ON "RefundHistory"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "RefundHistory_stripePaymentIntentId_idx" ON "RefundHistory"("stripePaymentIntentId");

-- CreateIndex
CREATE INDEX "Ticket_parentTicketId_idx" ON "Ticket"("parentTicketId");

-- CreateIndex
CREATE INDEX "Ticket_issuedByReservationId_idx" ON "Ticket"("issuedByReservationId");

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_parentTicketId_fkey" FOREIGN KEY ("parentTicketId") REFERENCES "Ticket"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_issuedByReservationId_fkey" FOREIGN KEY ("issuedByReservationId") REFERENCES "Reservation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketChangeLog" ADD CONSTRAINT "TicketChangeLog_consumedTicketId_fkey" FOREIGN KEY ("consumedTicketId") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketChangeLog" ADD CONSTRAINT "TicketChangeLog_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefundHistory" ADD CONSTRAINT "RefundHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

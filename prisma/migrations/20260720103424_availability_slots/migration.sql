-- CreateEnum
CREATE TYPE "AvailabilitySlotStatus" AS ENUM ('open', 'reserved');

-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN     "startAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "EmployeeAvailabilitySlot" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL,
    "status" "AvailabilitySlotStatus" NOT NULL DEFAULT 'open',
    "reservationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeAvailabilitySlot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EmployeeAvailabilitySlot_employeeId_startAt_status_idx" ON "EmployeeAvailabilitySlot"("employeeId", "startAt", "status");

-- CreateIndex
CREATE INDEX "EmployeeAvailabilitySlot_startAt_status_idx" ON "EmployeeAvailabilitySlot"("startAt", "status");

-- CreateIndex
CREATE INDEX "EmployeeAvailabilitySlot_reservationId_idx" ON "EmployeeAvailabilitySlot"("reservationId");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeAvailabilitySlot_employeeId_startAt_key" ON "EmployeeAvailabilitySlot"("employeeId", "startAt");

-- CreateIndex
CREATE INDEX "Reservation_startAt_idx" ON "Reservation"("startAt");

-- AddForeignKey
ALTER TABLE "EmployeeAvailabilitySlot" ADD CONSTRAINT "EmployeeAvailabilitySlot_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeAvailabilitySlot" ADD CONSTRAINT "EmployeeAvailabilitySlot_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

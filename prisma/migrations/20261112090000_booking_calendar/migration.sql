-- Online booking calendar: weekly hours, blocked days/times, extra hours, and saved bookings.

-- CreateEnum
CREATE TYPE "BookingMode" AS ENUM ('IN_PERSON', 'DISTANCE');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('HELD', 'CONFIRMED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CalendarChangeKind" AS ENUM ('BLOCK', 'EXTRA');

-- AlterTable
ALTER TABLE "Settings" ADD COLUMN     "bookingDaysAhead" INTEGER NOT NULL DEFAULT 90,
ADD COLUMN     "bookingDistanceBreak" INTEGER NOT NULL DEFAULT 60,
ADD COLUMN     "bookingDistanceMinutes" INTEGER NOT NULL DEFAULT 60,
ADD COLUMN     "bookingInPersonBreak" INTEGER NOT NULL DEFAULT 30,
ADD COLUMN     "bookingInPersonMinutes" INTEGER NOT NULL DEFAULT 90,
ADD COLUMN     "bookingNoticeHours" INTEGER NOT NULL DEFAULT 12;

-- CreateTable
CREATE TABLE "WorkingHours" (
    "id" TEXT NOT NULL,
    "mode" "BookingMode" NOT NULL,
    "weekday" INTEGER NOT NULL,
    "start" TEXT NOT NULL,
    "end" TEXT NOT NULL,

    CONSTRAINT "WorkingHours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CalendarChange" (
    "id" TEXT NOT NULL,
    "kind" "CalendarChangeKind" NOT NULL,
    "fromDate" TEXT NOT NULL,
    "toDate" TEXT NOT NULL,
    "start" TEXT,
    "end" TEXT,
    "mode" "BookingMode",
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CalendarChange_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'HELD',
    "mode" "BookingMode" NOT NULL,
    "sessionType" TEXT NOT NULL,
    "service" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "start" TEXT NOT NULL,
    "end" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "heldUntil" TIMESTAMP(3),
    "clientName" TEXT NOT NULL,
    "clientEmail" TEXT NOT NULL,
    "clientPhone" TEXT,
    "concerns" TEXT,
    "previousTherapy" TEXT,
    "medicalConditions" TEXT,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'aud',
    "paymentIntentId" TEXT,
    "emailedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WorkingHours_mode_weekday_idx" ON "WorkingHours"("mode", "weekday");

-- CreateIndex
CREATE INDEX "CalendarChange_toDate_idx" ON "CalendarChange"("toDate");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_paymentIntentId_key" ON "Booking"("paymentIntentId");

-- CreateIndex
CREATE INDEX "Booking_date_status_idx" ON "Booking"("date", "status");

-- CreateIndex
CREATE INDEX "Booking_startsAt_idx" ON "Booking"("startsAt");

-- Start with the hours the booking page used before:
-- in-person on Saturdays 8:00 am - 7:30 pm, distance Monday to Saturday 9:00 am - 6:00 pm.
INSERT INTO "WorkingHours" ("id", "mode", "weekday", "start", "end") VALUES
  (gen_random_uuid()::text, 'IN_PERSON', 6, '08:00', '19:30'),
  (gen_random_uuid()::text, 'DISTANCE', 1, '09:00', '18:00'),
  (gen_random_uuid()::text, 'DISTANCE', 2, '09:00', '18:00'),
  (gen_random_uuid()::text, 'DISTANCE', 3, '09:00', '18:00'),
  (gen_random_uuid()::text, 'DISTANCE', 4, '09:00', '18:00'),
  (gen_random_uuid()::text, 'DISTANCE', 5, '09:00', '18:00'),
  (gen_random_uuid()::text, 'DISTANCE', 6, '09:00', '18:00');

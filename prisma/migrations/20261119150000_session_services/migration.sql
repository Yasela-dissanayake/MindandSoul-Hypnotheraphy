-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "credit" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "optionId" TEXT,
ADD COLUMN     "planId" TEXT,
ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "Plan" ADD COLUMN     "sessionServiceId" TEXT;

-- CreateTable
CREATE TABLE "SessionService" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "details" TEXT,
    "highlights" TEXT,
    "planService" "Service",
    "minutes" INTEGER,
    "lengthLabel" TEXT,
    "inPerson" BOOLEAN NOT NULL DEFAULT true,
    "online" BOOLEAN NOT NULL DEFAULT true,
    "enquiryOnly" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "imageKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SessionService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionOption" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "sessions" INTEGER NOT NULL DEFAULT 1,
    "price" INTEGER NOT NULL,
    "priceAed" INTEGER,
    "mode" "BookingMode",
    "note" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SessionOption_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SessionService_slug_key" ON "SessionService"("slug");

-- CreateIndex
CREATE INDEX "SessionOption_serviceId_order_idx" ON "SessionOption"("serviceId", "order");

-- CreateIndex
CREATE INDEX "Booking_planId_status_idx" ON "Booking"("planId", "status");

-- AddForeignKey
ALTER TABLE "Plan" ADD CONSTRAINT "Plan_sessionServiceId_fkey" FOREIGN KEY ("sessionServiceId") REFERENCES "SessionService"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "SessionOption"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionOption" ADD CONSTRAINT "SessionOption_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "SessionService"("id") ON DELETE CASCADE ON UPDATE CASCADE;


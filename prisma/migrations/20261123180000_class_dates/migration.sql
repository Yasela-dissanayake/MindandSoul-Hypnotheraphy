-- Class days for live Reiki Training classes (entered in Perth time, shown in each visitor's own time zone),
-- and the buyer's time zone on class purchases (for the enrollment email).

-- AlterTable
ALTER TABLE "CoursePurchase" ADD COLUMN "timezone" TEXT;

-- CreateTable
CREATE TABLE "ClassDate" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "start" TEXT NOT NULL,
    "end" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClassDate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ClassDate_courseId_startsAt_idx" ON "ClassDate"("courseId", "startsAt");

-- AddForeignKey
ALTER TABLE "ClassDate" ADD CONSTRAINT "ClassDate_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

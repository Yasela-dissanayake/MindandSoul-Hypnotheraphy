BEGIN;

-- CreateEnum
CREATE TYPE "Service" AS ENUM ('REIKI_HEALING', 'ANIMAL_REIKI', 'HYPNOTHERAPY');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ResourceKind" ADD VALUE 'DOCUMENT';
ALTER TYPE "ResourceKind" ADD VALUE 'IMAGE';
ALTER TYPE "ResourceKind" ADD VALUE 'LINK';





-- CreateTable
CREATE TABLE "Tracker" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "fields" JSONB NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tracker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrackerEntry" (
    "id" TEXT NOT NULL,
    "trackerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "forDate" TEXT NOT NULL,
    "values" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrackerEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Submission" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planId" TEXT,
    "title" TEXT NOT NULL,
    "note" TEXT,
    "storageKey" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "originalName" TEXT NOT NULL,
    "seenAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseModule" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CourseModule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseItem" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "moduleId" TEXT,
    "resourceId" TEXT NOT NULL,
    "note" TEXT,
    "extra" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CourseItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Enrollment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "certificateKey" TEXT,
    "certificateName" TEXT,
    "certificateType" TEXT,
    "certificateAt" TIMESTAMP(3),

    CONSTRAINT "Enrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModuleProgress" (
    "id" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ModuleProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TrackerEntry_userId_forDate_idx" ON "TrackerEntry"("userId", "forDate");

-- CreateIndex
CREATE UNIQUE INDEX "TrackerEntry_trackerId_forDate_key" ON "TrackerEntry"("trackerId", "forDate");

-- CreateIndex
CREATE INDEX "Submission_userId_createdAt_idx" ON "Submission"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "CourseItem_courseId_resourceId_key" ON "CourseItem"("courseId", "resourceId");

-- CreateIndex
CREATE UNIQUE INDEX "Enrollment_userId_courseId_key" ON "Enrollment"("userId", "courseId");

-- CreateIndex
CREATE UNIQUE INDEX "ModuleProgress_enrollmentId_moduleId_key" ON "ModuleProgress"("enrollmentId", "moduleId");

-- AddForeignKey
ALTER TABLE "Tracker" ADD CONSTRAINT "Tracker_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrackerEntry" ADD CONSTRAINT "TrackerEntry_trackerId_fkey" FOREIGN KEY ("trackerId") REFERENCES "Tracker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrackerEntry" ADD CONSTRAINT "TrackerEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseModule" ADD CONSTRAINT "CourseModule_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseItem" ADD CONSTRAINT "CourseItem_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseItem" ADD CONSTRAINT "CourseItem_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "CourseModule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseItem" ADD CONSTRAINT "CourseItem_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModuleProgress" ADD CONSTRAINT "ModuleProgress_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModuleProgress" ADD CONSTRAINT "ModuleProgress_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "CourseModule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ===========================================================================
-- Data conversion (hand-written)
-- ===========================================================================

-- Library: new "tag" column, filled from the old Reiki level / module label.
ALTER TABLE "Resource" ADD COLUMN "tag" TEXT;
UPDATE "Resource" SET "tag" = COALESCE(
  NULLIF("moduleLabel", ''),
  CASE WHEN "reikiLevel" IS NOT NULL THEN 'Reiki Level ' || "reikiLevel" END
);

-- The four courses Rangika teaches (fixed ids so they exist everywhere).
INSERT INTO "Course" ("id", "title", "description", "order", "createdAt", "updatedAt") VALUES
  ('course-reiki-1', 'Reiki Level 1', 'First degree Reiki: self-healing and the foundations of Reiki.', 1, NOW(), NOW()),
  ('course-reiki-2', 'Reiki Level 2', 'Second degree Reiki: symbols, distance healing and healing others.', 2, NOW(), NOW()),
  ('course-reiki-3', 'Reiki Level 3', 'Third degree Reiki: master level practice.', 3, NOW(), NOW()),
  ('course-animal-reiki', 'Animal Reiki & Communication', 'Reiki and communication for animals.', 4, NOW(), NOW());

-- Reiki "plans" that were really courses (they had a Reiki level) become course enrolments.
INSERT INTO "Enrollment" ("id", "userId", "courseId", "startedAt")
SELECT 'enr-' || p."id", p."userId", 'course-reiki-' || p."reikiLevel", p."createdAt"
FROM "Plan" p
WHERE p."userId" IS NOT NULL AND p."reikiLevel" BETWEEN 1 AND 3
ON CONFLICT DO NOTHING;
DELETE FROM "Plan" WHERE "userId" IS NOT NULL AND "reikiLevel" BETWEEN 1 AND 3;

-- Session plans: new "service" column from the old programme.
ALTER TABLE "Plan" ADD COLUMN "meetingLink" TEXT;
ALTER TABLE "Plan" ADD COLUMN "service" "Service";
UPDATE "Plan" SET "service" = CASE WHEN "programme" = 'HYPNOTHERAPY' THEN 'HYPNOTHERAPY'::"Service" ELSE 'REIKI_HEALING'::"Service" END;
ALTER TABLE "Plan" ALTER COLUMN "service" SET NOT NULL;

-- Remove the old "programme" columns.
ALTER TABLE "Plan" DROP COLUMN "programme", DROP COLUMN "reikiLevel";
ALTER TABLE "Resource" DROP COLUMN "moduleLabel", DROP COLUMN "programme", DROP COLUMN "reikiLevel";
ALTER TABLE "User" DROP COLUMN "programme";
DROP TYPE "Programme";

COMMIT;

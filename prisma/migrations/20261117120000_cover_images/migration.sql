-- Cover photos for courses and online learning packages
ALTER TABLE "Course" ADD COLUMN "imageKey" TEXT;

ALTER TABLE "LearningPackage" ADD COLUMN "imageKey" TEXT;

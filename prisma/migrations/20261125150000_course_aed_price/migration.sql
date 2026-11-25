-- An AED price for self-paced courses (shown to visitors in the UAE). Additive only.

-- AlterTable
ALTER TABLE "LearningPackage" ADD COLUMN "priceAed" INTEGER;

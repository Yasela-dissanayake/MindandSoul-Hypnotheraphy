-- A promotion can take a percentage off the linked session, class or course.
ALTER TABLE "Promotion" ADD COLUMN "discountPercent" INTEGER;

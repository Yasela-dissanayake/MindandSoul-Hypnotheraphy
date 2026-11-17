-- "New" markers in the dashboard: set when Rangika has seen a booking or purchase.
ALTER TABLE "Booking" ADD COLUMN "seenAt" TIMESTAMP(3);
ALTER TABLE "CoursePurchase" ADD COLUMN "seenAt" TIMESTAMP(3);
ALTER TABLE "PackagePurchase" ADD COLUMN "seenAt" TIMESTAMP(3);

-- Bookings from before today count as seen; recent ones stay "new" so they show up.
UPDATE "Booking" SET "seenAt" = NOW() WHERE "createdAt" < NOW() - INTERVAL '3 days';

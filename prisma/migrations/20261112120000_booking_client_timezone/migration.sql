-- The client's own time zone, so their confirmation email shows the time where they are.
ALTER TABLE "Booking" ADD COLUMN "clientTimezone" TEXT;

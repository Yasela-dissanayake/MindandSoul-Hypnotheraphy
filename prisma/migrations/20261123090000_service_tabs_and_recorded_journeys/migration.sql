-- Website tabs (Clinical Hypnotherapy / Reiki Energy Healing / Reiki Training) and self-paced recorded journeys.
CREATE TYPE "TrainingTrack" AS ENUM ('REIKI', 'ANIMAL');
ALTER TABLE "Course" ADD COLUMN "track" "TrainingTrack" NOT NULL DEFAULT 'REIKI';

ALTER TABLE "SessionService" ADD COLUMN "category" "Service" NOT NULL DEFAULT 'HYPNOTHERAPY';
ALTER TABLE "SessionService" ADD COLUMN "tagline" TEXT;
ALTER TABLE "SessionService" ADD COLUMN "body" TEXT;

ALTER TABLE "SessionOption" ADD COLUMN "recorded" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Booking" ADD COLUMN "recorded" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Plan" ADD COLUMN "selfPaced" BOOLEAN NOT NULL DEFAULT false;

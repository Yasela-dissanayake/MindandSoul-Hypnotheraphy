-- What a person asks for when requesting access (sessions or a course), with a message and phone.

-- AlterTable
ALTER TABLE "AccessRequest" ADD COLUMN     "detailsAt" TIMESTAMP(3),
ADD COLUMN     "message" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "wants" TEXT,
ADD COLUMN     "wantsCourseId" TEXT,
ADD COLUMN     "wantsService" TEXT;


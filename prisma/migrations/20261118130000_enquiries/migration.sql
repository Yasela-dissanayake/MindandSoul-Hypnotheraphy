-- Contact form messages (free consultation requests and questions), shown in the dashboard.
CREATE TYPE "EnquiryKind" AS ENUM ('CONSULTATION', 'QUESTION');

CREATE TABLE "Enquiry" (
    "id" TEXT NOT NULL,
    "kind" "EnquiryKind" NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "contactMethod" TEXT,
    "topic" TEXT,
    "message" TEXT,
    "handledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Enquiry_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Enquiry_handledAt_createdAt_idx" ON "Enquiry"("handledAt", "createdAt");

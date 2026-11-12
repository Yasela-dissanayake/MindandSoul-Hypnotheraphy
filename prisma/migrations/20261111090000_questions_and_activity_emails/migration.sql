BEGIN;

-- Clients can type a question about their work; Rangika answers it.
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planId" TEXT,
    "topic" TEXT,
    "topicHref" TEXT,
    "body" TEXT NOT NULL,
    "answer" TEXT,
    "answeredAt" TIMESTAMP(3),
    "answerSeenAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Question_userId_createdAt_idx" ON "Question"("userId", "createdAt");
CREATE INDEX "Question_answeredAt_idx" ON "Question"("answeredAt");

ALTER TABLE "Question" ADD CONSTRAINT "Question_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Question" ADD CONSTRAINT "Question_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Email Rangika when a client sends a journal entry, tracker answers or an upload.
ALTER TABLE "Settings" ADD COLUMN "activityEmails" BOOLEAN NOT NULL DEFAULT true;

COMMIT;

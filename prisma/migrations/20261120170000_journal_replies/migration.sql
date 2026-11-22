-- Rangika can reply to a journal entry (text and/or a voice message).
ALTER TABLE "JournalEntry" ADD COLUMN IF NOT EXISTS "replyText" TEXT;
ALTER TABLE "JournalEntry" ADD COLUMN IF NOT EXISTS "replyAudioKey" TEXT;
ALTER TABLE "JournalEntry" ADD COLUMN IF NOT EXISTS "replyAudioType" TEXT;
ALTER TABLE "JournalEntry" ADD COLUMN IF NOT EXISTS "replyAudioSeconds" INTEGER;
ALTER TABLE "JournalEntry" ADD COLUMN IF NOT EXISTS "repliedAt" TIMESTAMP(3);
ALTER TABLE "JournalEntry" ADD COLUMN IF NOT EXISTS "replySeenAt" TIMESTAMP(3);

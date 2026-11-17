-- Selling taught courses on the website
ALTER TABLE "Course" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'aud',
ADD COLUMN     "details" TEXT,
ADD COLUMN     "format" TEXT,
ADD COLUMN     "price" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "published" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "schedule" TEXT,
ADD COLUMN     "seats" INTEGER,
ADD COLUMN     "slug" TEXT,
ADD COLUMN     "summary" TEXT;

-- CreateTable
CREATE TABLE "CoursePurchase" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "status" "PurchaseStatus" NOT NULL DEFAULT 'PENDING',
    "paymentIntentId" TEXT,
    "userId" TEXT,
    "newAccount" BOOLEAN NOT NULL DEFAULT false,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CoursePurchase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CoursePurchase_paymentIntentId_key" ON "CoursePurchase"("paymentIntentId");

-- CreateIndex
CREATE INDEX "CoursePurchase_status_createdAt_idx" ON "CoursePurchase"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Course_slug_key" ON "Course"("slug");

-- AddForeignKey
ALTER TABLE "CoursePurchase" ADD CONSTRAINT "CoursePurchase_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

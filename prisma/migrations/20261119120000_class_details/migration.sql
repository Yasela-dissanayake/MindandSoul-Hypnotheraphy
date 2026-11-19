-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "highlights" TEXT,
ADD COLUMN     "prerequisite" TEXT,
ADD COLUMN     "priceAed" INTEGER;

-- CreateTable
CREATE TABLE "_ClassBundle" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ClassBundle_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ClassBundle_B_index" ON "_ClassBundle"("B");

-- AddForeignKey
ALTER TABLE "_ClassBundle" ADD CONSTRAINT "_ClassBundle_A_fkey" FOREIGN KEY ("A") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClassBundle" ADD CONSTRAINT "_ClassBundle_B_fkey" FOREIGN KEY ("B") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;


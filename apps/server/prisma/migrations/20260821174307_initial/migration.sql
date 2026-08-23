-- CreateTable
CREATE TABLE "Nomination" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "listingUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Nomination_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Nomination_listingUrl_key" ON "Nomination"("listingUrl");

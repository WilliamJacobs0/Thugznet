DROP TABLE "Nomination";

CREATE TABLE "Thug" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Thug_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Thugzcation" (
    "id" SERIAL NOT NULL,
    "year" INTEGER NOT NULL,
    "selectedThugzMansionId" INTEGER,

    CONSTRAINT "Thugzcation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ThugzMansion" (
    "id" SERIAL NOT NULL,
    "thugzcationId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "listingUrl" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "location" TEXT,
    "bedrooms" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ThugzMansion_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Thug_name_key" ON "Thug"("name");
CREATE UNIQUE INDEX "Thugzcation_year_key" ON "Thugzcation"("year");
CREATE UNIQUE INDEX "Thugzcation_selectedThugzMansionId_key" ON "Thugzcation"("selectedThugzMansionId");
CREATE UNIQUE INDEX "ThugzMansion_thugzcationId_listingUrl_key" ON "ThugzMansion"("thugzcationId", "listingUrl");

ALTER TABLE "Thugzcation"
ADD CONSTRAINT "Thugzcation_selectedThugzMansionId_fkey"
FOREIGN KEY ("selectedThugzMansionId") REFERENCES "ThugzMansion"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ThugzMansion"
ADD CONSTRAINT "ThugzMansion_thugzcationId_fkey"
FOREIGN KEY ("thugzcationId") REFERENCES "Thugzcation"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Thug" RENAME COLUMN "name" TO "firstName";
ALTER TABLE "Thug" ADD COLUMN "displayName" TEXT;
ALTER TABLE "Thug" ADD COLUMN "entraObjectId" TEXT;

UPDATE "Thug" SET "displayName" = "firstName";
UPDATE "Thug" SET "firstName" = 'Willie' WHERE "firstName" = 'Willie Steel';
UPDATE "Thug" SET "firstName" = 'Jake' WHERE "firstName" = 'Jake Jarkin';

ALTER TABLE "Thug" ALTER COLUMN "displayName" SET NOT NULL;
DROP INDEX "Thug_name_key";
CREATE UNIQUE INDEX "Thug_firstName_key" ON "Thug"("firstName");
CREATE UNIQUE INDEX "Thug_entraObjectId_key" ON "Thug"("entraObjectId");

ALTER TABLE "ThugzMansion" ADD COLUMN "nominatedByThugId" INTEGER;
UPDATE "ThugzMansion"
SET "nominatedByThugId" = (
    SELECT "id" FROM "Thug" WHERE "firstName" = 'Willie'
);
ALTER TABLE "ThugzMansion" ALTER COLUMN "nominatedByThugId" SET NOT NULL;

CREATE INDEX "ThugzMansion_nominatedByThugId_idx" ON "ThugzMansion"("nominatedByThugId");
ALTER TABLE "ThugzMansion"
ADD CONSTRAINT "ThugzMansion_nominatedByThugId_fkey"
FOREIGN KEY ("nominatedByThugId") REFERENCES "Thug"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Game" (
    "id" SERIAL NOT NULL,
    "joinCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "World" (
    "id" SERIAL NOT NULL,
    "gameId" INTEGER NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "attributes" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "World_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Player" (
    "id" SERIAL NOT NULL,
    "gameId" INTEGER NOT NULL,
    "thugId" INTEGER NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Character" (
    "id" SERIAL NOT NULL,
    "worldId" INTEGER NOT NULL,
    "controlledByPlayerId" INTEGER,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "attributes" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "Character_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Location" (
    "id" SERIAL NOT NULL,
    "worldId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "attributes" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Thing" (
    "id" SERIAL NOT NULL,
    "worldId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "attributes" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "Thing_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Turn" (
    "id" SERIAL NOT NULL,
    "gameId" INTEGER NOT NULL,
    "number" INTEGER NOT NULL,
    "prompt" TEXT NOT NULL,
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closesAt" TIMESTAMP(3) NOT NULL,
    "resolvedAt" TIMESTAMP(3),
    "narrative" TEXT,

    CONSTRAINT "Turn_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PlayerInput" (
    "id" SERIAL NOT NULL,
    "turnId" INTEGER NOT NULL,
    "playerId" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlayerInput_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Game_joinCode_key" ON "Game"("joinCode");
CREATE UNIQUE INDEX "World_gameId_key" ON "World"("gameId");
CREATE UNIQUE INDEX "Player_gameId_thugId_key" ON "Player"("gameId", "thugId");
CREATE INDEX "Player_thugId_idx" ON "Player"("thugId");
CREATE INDEX "Character_worldId_idx" ON "Character"("worldId");
CREATE INDEX "Character_controlledByPlayerId_idx" ON "Character"("controlledByPlayerId");
CREATE INDEX "Location_worldId_idx" ON "Location"("worldId");
CREATE INDEX "Thing_worldId_idx" ON "Thing"("worldId");
CREATE UNIQUE INDEX "Turn_gameId_number_key" ON "Turn"("gameId", "number");
CREATE INDEX "Turn_gameId_resolvedAt_idx" ON "Turn"("gameId", "resolvedAt");
CREATE INDEX "PlayerInput_turnId_createdAt_idx" ON "PlayerInput"("turnId", "createdAt");
CREATE INDEX "PlayerInput_playerId_idx" ON "PlayerInput"("playerId");

ALTER TABLE "World"
ADD CONSTRAINT "World_gameId_fkey"
FOREIGN KEY ("gameId") REFERENCES "Game"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Player"
ADD CONSTRAINT "Player_gameId_fkey"
FOREIGN KEY ("gameId") REFERENCES "Game"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Player"
ADD CONSTRAINT "Player_thugId_fkey"
FOREIGN KEY ("thugId") REFERENCES "Thug"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Character"
ADD CONSTRAINT "Character_worldId_fkey"
FOREIGN KEY ("worldId") REFERENCES "World"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Character"
ADD CONSTRAINT "Character_controlledByPlayerId_fkey"
FOREIGN KEY ("controlledByPlayerId") REFERENCES "Player"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Location"
ADD CONSTRAINT "Location_worldId_fkey"
FOREIGN KEY ("worldId") REFERENCES "World"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Thing"
ADD CONSTRAINT "Thing_worldId_fkey"
FOREIGN KEY ("worldId") REFERENCES "World"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Turn"
ADD CONSTRAINT "Turn_gameId_fkey"
FOREIGN KEY ("gameId") REFERENCES "Game"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PlayerInput"
ADD CONSTRAINT "PlayerInput_turnId_fkey"
FOREIGN KEY ("turnId") REFERENCES "Turn"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PlayerInput"
ADD CONSTRAINT "PlayerInput_playerId_fkey"
FOREIGN KEY ("playerId") REFERENCES "Player"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

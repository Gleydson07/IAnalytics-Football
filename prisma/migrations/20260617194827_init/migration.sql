-- CreateTable
CREATE TABLE "preferred_leagues" (
    "id" TEXT NOT NULL,
    "league_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "season" INTEGER NOT NULL,
    "logo" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "preferred_leagues_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "preferred_leagues_league_id_key" ON "preferred_leagues"("league_id");

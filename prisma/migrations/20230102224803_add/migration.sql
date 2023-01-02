-- CreateTable
CREATE TABLE "League" (
    "id" SERIAL NOT NULL,
    "hash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "isLocked" BOOLEAN NOT NULL,
    "isArchived" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "League_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsersOnLeagues" (
    "leagueId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "UsersOnLeagues_pkey" PRIMARY KEY ("leagueId","userId")
);

-- AddForeignKey
ALTER TABLE "League" ADD CONSTRAINT "League_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsersOnLeagues" ADD CONSTRAINT "UsersOnLeagues_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "League"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsersOnLeagues" ADD CONSTRAINT "UsersOnLeagues_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

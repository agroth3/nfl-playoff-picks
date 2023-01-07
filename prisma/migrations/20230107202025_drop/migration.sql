/*
  Warnings:

  - You are about to drop the `League` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Note` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Password` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Team` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UsersOnLeagues` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "League" DROP CONSTRAINT "League_userId_fkey";

-- DropForeignKey
ALTER TABLE "Note" DROP CONSTRAINT "Note_userId_fkey";

-- DropForeignKey
ALTER TABLE "Password" DROP CONSTRAINT "Password_userId_fkey";

-- DropForeignKey
ALTER TABLE "Team" DROP CONSTRAINT "Team_leagueId_fkey";

-- DropForeignKey
ALTER TABLE "UsersOnLeagues" DROP CONSTRAINT "UsersOnLeagues_leagueId_fkey";

-- DropForeignKey
ALTER TABLE "UsersOnLeagues" DROP CONSTRAINT "UsersOnLeagues_userId_fkey";

-- DropTable
DROP TABLE "League";

-- DropTable
DROP TABLE "Note";

-- DropTable
DROP TABLE "Password";

-- DropTable
DROP TABLE "Team";

-- DropTable
DROP TABLE "User";

-- DropTable
DROP TABLE "UsersOnLeagues";

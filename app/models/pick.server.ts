import type { League, Pick, Team, User } from "@prisma/client";

import { prisma } from "~/db.server";

export type { Pick } from "@prisma/client";

export async function getPicks({
  leagueId,
  userId,
}: {
  leagueId: League["id"];
  userId: User["id"];
}) {
  return prisma.pick.findMany({
    where: {
      leagueId,
      userId,
    },
  });
}

export async function createPick({
  leagueId,
  userId,
  teamId,
  points,
}: {
  leagueId: Pick["leagueId"];
  userId: Pick["userId"];
  teamId: Pick["teamId"];
  points: Pick["points"];
}) {
  return prisma.pick.create({
    data: { points, leagueId, userId, teamId },
  });
}

export async function upsertPick({
  leagueId,
  userId,
  teamId,
  points,
}: {
  leagueId: Pick["leagueId"];
  userId: Pick["userId"];
  teamId: Pick["teamId"];
  points: Pick["points"];
}) {
  return prisma.pick.upsert({
    create: { points, userId, leagueId, teamId },
    update: { points },
    where: {
      leagueId_userId_teamId: {
        leagueId,
        userId,
        teamId,
      },
    },
  });
}

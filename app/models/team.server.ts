import type { League, Team } from "@prisma/client";

import { prisma } from "~/db.server";

export type { Team } from "@prisma/client";

export async function getTeams({ leagueId }: { leagueId: League["id"] }) {
  return prisma.team.findMany({
    select: {
      id: true,
      name: true,
      abbreviation: true,
      conference: true,
      rank: true,
      wins: true,
      imageUri: true,
    },
    where: {
      leagueId,
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function createTeam({
  leagueId,
  name,
  abbreviation,
  conference,
  imageUri,
}: { leagueId: League["id"] } & Pick<
  Team,
  "name" | "abbreviation" | "conference" | "imageUri"
>) {
  return prisma.team.create({
    data: {
      name,
      abbreviation,
      conference,
      imageUri,
      league: { connect: { id: leagueId } },
      wins: 0,
      rank: 0,
    },
  });
}

export async function deleteTeam({ teamId }: { teamId: Team["id"] }) {
  return prisma.team.delete({
    where: {
      id: teamId,
    },
  });
}

export async function updateTeam({
  id,
  rank,
  wins,
  name,
  abbreviation,
  imageUri,
}: Pick<Team, "id" | "rank" | "wins" | "name" | "abbreviation" | "imageUri">) {
  console.log("UPDATE TEAM ", name, imageUri);
  return prisma.team.update({
    data: {
      rank,
      wins,
      name,
      abbreviation,
      imageUri,
    },
    where: { id },
  });
}

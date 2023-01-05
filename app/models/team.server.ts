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
}: { leagueId: League["id"] } & Pick<
  Team,
  "name" | "abbreviation" | "conference"
>) {
  return prisma.team.create({
    data: {
      name,
      abbreviation,
      conference,
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
}: Pick<Team, "id" | "rank" | "wins" | "name" | "abbreviation">) {
  return prisma.team.update({
    data: {
      rank,
      wins,
      name,
      abbreviation,
    },
    where: { id },
  });
}

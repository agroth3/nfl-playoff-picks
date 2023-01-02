import type { User, League } from "@prisma/client";
import bcrypt from "bcryptjs";

import { prisma } from "~/db.server";

export type { League } from "@prisma/client";

export function getLeague({
  id,
  userId,
}: Pick<League, "id"> & {
  userId: User["id"];
}) {
  return prisma.league.findFirst({
    select: {
      id: true,
      name: true,
      userId: true,
      hash: true,
      users: { select: { user: true } },
    },
    where: { id, userId },
  });
}

export async function getLeagueListItems({ userId }: { userId: User["id"] }) {
  return prisma.usersOnLeagues.findMany({
    select: { league: true },
    where: {
      userId,
    },
  });
}

export async function createLeague({
  name,
  password,
  userId,
}: Pick<League, "name" | "password"> & {
  userId: User["id"];
}) {
  const hashedPassword = await bcrypt.hash(password, 10);

  const league = await prisma.league.create({
    data: {
      name,
      password: hashedPassword,
      isLocked: false,
      isArchived: false,
      user: {
        connect: {
          id: userId,
        },
      },
    },
  });

  await prisma.usersOnLeagues.create({
    data: {
      leagueId: league.id,
      userId: userId,
    },
  });

  return league;
}

export async function joinLeague({
  hash,
  userId,
}: Pick<League, "hash"> & {
  userId: User["id"];
}) {
  const league = await prisma.league.findFirst({ where: { hash } });

  if (!league) {
    return null;
  }

  const existingRecord = await prisma.usersOnLeagues.findFirst({
    where: {
      userId,
      leagueId: league.id,
    },
  });

  if (existingRecord) {
    return existingRecord;
  }

  return prisma.usersOnLeagues.create({
    data: {
      leagueId: league.id,
      userId,
    },
  });
}

export async function verifyLeaguePassword(
  hash: League["hash"],
  password: League["password"]
) {
  const leagueWithPassword = await prisma.league.findFirst({
    where: { hash },
  });

  if (!leagueWithPassword || !leagueWithPassword.password) {
    return null;
  }

  const isValid = await bcrypt.compare(password, leagueWithPassword.password);

  if (!isValid) {
    return null;
  }

  const { password: _password, ...leagueWithoutPassword } = leagueWithPassword;

  return leagueWithoutPassword;
}

export async function deleteLeague({ leagueId }: { leagueId: League["id"] }) {
  await prisma.usersOnLeagues.deleteMany({
    where: { leagueId },
  });

  return prisma.league.delete({
    where: { id: leagueId },
  });
}

export async function deleteLeagueUser({
  userId,
  leagueId,
}: {
  userId: User["id"];
  leagueId: League["id"];
}) {
  return prisma.usersOnLeagues.delete({
    where: {
      leagueId_userId: {
        userId,
        leagueId,
      },
    },
  });
}

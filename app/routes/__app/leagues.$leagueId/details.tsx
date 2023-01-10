import { InformationCircleIcon } from "@heroicons/react/24/solid";
import { Link, useLoaderData, useMatches } from "@remix-run/react";
import { json, LoaderArgs } from "@remix-run/server-runtime";
import invariant from "tiny-invariant";
import { League } from "~/models/league.server";
import { getLeagueMemberPicks } from "~/models/pick.server";
import { getTeams, Team } from "~/models/team.server";
import { requireUserId } from "~/session.server";
import { useMatchesData } from "~/utils";
import { Pick as UserPick } from "~/models/pick.server";
import { cardClasses } from "~/components/Inputs";
import classNames from "classnames";

export const handle = {
  breadcrumb: () => "Leaderboard",
};

interface ScoreboardModel {
  name: string;
  points: number;
}

export const loader = async ({ request, params }: LoaderArgs) => {
  const userId = await requireUserId(request);
  const leagueId = Number(params.leagueId);
  invariant(params.leagueId, "leagueId not found");

  const teams = await (
    await getTeams({ leagueId })
  ).sort((a, b) => (a.rank < b.rank ? -1 : 1));
  const memberPicks = await getLeagueMemberPicks({ leagueId });

  const memberPicksWithPoints = memberPicks.reduce((prev, curr) => {
    const name = `${curr.user.firstName} ${curr.user.lastName}`;
    if (prev[curr.user.id]) {
      prev[curr.user.id] = [
        ...prev[curr.user.id],
        { name, team: curr.team, points: curr.points },
      ];
    } else {
      prev[curr.user.id] = [{ name, team: curr.team, points: curr.points }];
    }

    return prev;
  }, {} as Record<string, { name: string; team: Team; points: number }[]>);

  let rows = [["entry name", ...teams.map((team) => team.imageUri)]];

  Object.entries(memberPicksWithPoints).forEach(([key, picks]) => {
    const name = picks[0].name;

    let columns = [];
    columns.push(name);

    teams.forEach((team) => {
      const currentUserPickedTeam = picks.find((p) => p.team.id === team.id);
      const points = currentUserPickedTeam?.points ?? 0;

      columns.push(points);
    });

    rows.push(columns);
  });

  const scoreboardObject = memberPicks.reduce((prev, curr) => {
    const currentTeamWins = curr.team.wins;
    const name = `${curr.user.firstName} ${curr.user.lastName}`;

    if (prev[name]) {
      prev[name] = prev[name] += currentTeamWins * curr.points;
    } else {
      prev[name] = currentTeamWins * curr.points;
    }

    return prev;
  }, {} as Record<string, number>);
  const scoreboardArray = Object.entries(scoreboardObject).map(
    ([name, points]) => {
      return { name, points } as ScoreboardModel;
    }
  );

  const rankedScoreboard = scoreboardArray.sort((a, b) =>
    a.points < b.points ? 1 : -1
  );

  return json({ rows, scoreboard: rankedScoreboard, userId, teams });
};

export default function LeagueDetailsPage() {
  const data = useLoaderData<typeof loader>();
  const { league } = useMatchesData("routes/__app/leagues.$leagueId") as {
    league: League;
  };

  const [headerRowData, ...rest] = data.rows;

  return (
    <div>
      {league?.isLocked === false && (
        <div className="p-4 rounded-md bg-blue-50">
          <div className="flex">
            <div className="flex-shrink-0">
              <InformationCircleIcon
                className="w-5 h-5 text-blue-400"
                aria-hidden="true"
              />
            </div>
            <div className="flex-1 ml-3 md:flex md:justify-between">
              <p className="text-sm text-blue-700">
                Leaderboard will be available once all picks are in and league
                is locked.
              </p>
            </div>
          </div>
        </div>
      )}
      {league.isLocked && (
        <div>
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-8">
              <div className={cardClasses}>
                <div className="p-6">
                  <h2 className="text-lg font-medium leading-6 text-navy">
                    Leaderboard
                  </h2>
                </div>
                <div className="p-6 border-t border-gray-200">
                  <div className="flex flex-col mt-8">
                    <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                      <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                        <table className="min-w-full divide-y divide-gray-300">
                          <thead>
                            <tr>
                              <th
                                scope="col"
                                className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 md:pl-0"
                              >
                                Rank
                              </th>
                              <th
                                scope="col"
                                className="py-3.5 px-3 text-left text-sm font-semibold text-gray-900"
                              >
                                Name
                              </th>
                              <th
                                scope="col"
                                className="py-3.5 px-3 text-left text-sm font-semibold text-gray-900"
                              >
                                Points
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {data.scoreboard.map((sb, index) => (
                              <tr key={sb.name}>
                                <td className="py-4 pl-4 pr-3 text-sm font-medium text-gray-900 whitespace-nowrap sm:pl-6 md:pl-0">
                                  {index + 1}
                                </td>
                                <td className="px-3 py-4 text-sm text-gray-500 whitespace-nowrap">
                                  {sb.name}
                                </td>
                                <td className="px-3 py-4 text-sm text-gray-500 whitespace-nowrap">
                                  {sb.points}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className={classNames("col-span-4")}>
              <div className={classNames(cardClasses)}>
                <div className="p-6">
                  <h2 className="flex justify-between text-lg font-medium leading-6 text-navy">
                    Team wins
                  </h2>
                </div>
                <div className="p-6 border-t border-gray-200">
                  <ul className="">
                    {data.teams
                      .sort((a, b) => (a.wins < b.wins ? 1 : -1))
                      .map((t) => (
                        <li key={t.id} className="flex justify-between py-2">
                          <span className="font-medium">{t.abbreviation}</span>
                          <span>{t.wins}</span>
                        </li>
                      ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8">
            <div className={cardClasses}>
              <div className="p-6">
                <h2 className="text-lg font-medium leading-6 text-navy">
                  Member picks
                </h2>
              </div>
              <div className="p-6 border-t border-gray-200">
                <div className="flex flex-col mt-8">
                  <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                      <table className="min-w-full divide-y divide-gray-300">
                        <thead>
                          <tr>
                            {headerRowData.map((value) => (
                              <th
                                key={value}
                                scope="col"
                                className="py-3.5 pl-3 pr-3 text-left text-sm font-semibold text-gray-900"
                              >
                                {value !== "entry name" ? (
                                  <img src={value} className="w-10 h-10" />
                                ) : (
                                  value
                                )}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {rest.map((value) => (
                            <tr key={value[0]}>
                              {value.map((p) => (
                                <td
                                  key={p}
                                  className="px-3 py-4 text-sm text-center text-gray-500 whitespace-nowrap"
                                >
                                  {p}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

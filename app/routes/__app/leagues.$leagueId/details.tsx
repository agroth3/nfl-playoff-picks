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

export const loader = async ({ request, params }: LoaderArgs) => {
  const userId = await requireUserId(request);
  const leagueId = Number(params.leagueId);
  invariant(params.leagueId, "leagueId not found");

  const memberPicks = await getLeagueMemberPicks({ leagueId });

  const picks = memberPicks.reduce((prev, curr) => {
    if (prev[curr.user.firstName]) {
      prev[curr.user.firstName] = [
        ...prev[curr.user.firstName],
        { team: curr.team, points: curr.points },
      ];
    } else {
      prev[curr.user.firstName] = [{ team: curr.team, points: curr.points }];
    }

    return prev;
  }, {} as Record<string, { team: Team; points: number }[]>);

  const myPicks = memberPicks.filter((mp) => mp.user.id === userId);

  return json({ picks, myPicks });
};

export default function LeagueDetailsPage() {
  const data = useLoaderData<typeof loader>();
  const { league } = useMatchesData("routes/__app/leagues.$leagueId") as {
    league: League;
  };

  const headerRowData = Object.values(data.picks)[0];

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
        <div className="grid grid-cols-12 gap-4">
          <div className={classNames("col-span-8")}>
            <div className={cardClasses}>
              <div className="p-6">
                <h2 className="text-lg font-medium leading-6 text-navy">
                  Leaderboard
                </h2>
              </div>
              <div className="p-6 border-t border-gray-200">
                <table>
                  <thead>
                    <tr>
                      <th className="w-20 p-2 text-left"></th>
                      {headerRowData.map((t) => (
                        <th key={t.team.id} className="w-12 p-2 text-left">
                          {t.team.abbreviation}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(data.picks).map(([key, value]) => (
                      <tr key={key}>
                        <td className="w-20 p-2">{key}</td>
                        {value.map((p) => (
                          <td key={p.team.id} className="w-12 p-2">
                            {p.points}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className={classNames("col-span-4")}>
            <div className={classNames(cardClasses)}>
              <div className="p-6">
                <h2 className="flex justify-between text-lg font-medium leading-6 text-navy">
                  Your picks
                  <Link to="../entries" className="text-sm hover:underline">
                    view
                  </Link>
                </h2>
              </div>
              <div className="p-6 border-t border-gray-200">
                <ul className="">
                  {data.myPicks
                    .sort((a, b) => (a.points < b.points ? 1 : -1))
                    .map((p) => (
                      <li key={p.team.id} className="flex justify-between py-2">
                        <span className="font-medium">
                          {p.team.abbreviation}
                        </span>
                        <span>{p.points}</span>
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

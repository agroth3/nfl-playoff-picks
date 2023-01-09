import { InformationCircleIcon } from "@heroicons/react/24/solid";
import { useMatches } from "@remix-run/react";
import { json, LoaderArgs } from "@remix-run/server-runtime";
import invariant from "tiny-invariant";
import { League } from "~/models/league.server";
import { requireUserId } from "~/session.server";

export const handle = {
  breadcrumb: () => "Leaderboard",
};

export const loader = async ({ request, params }: LoaderArgs) => {
  const userId = await requireUserId(request);
  const leagueId = Number(params.leagueId);
  invariant(params.leagueId, "leagueId not found");

  return json({});
};

export default function LeagueDetailsPage() {
  const matches = useMatches();
  const { league } = matches.find(
    (m) => m.id === "routes/__app/leagues.$leagueId"
  )?.data as { league: League };

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
    </div>
  );
}

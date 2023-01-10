import { InformationCircleIcon } from "@heroicons/react/24/solid";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { ActionArgs, json, LoaderArgs } from "@remix-run/server-runtime";
import classNames from "classnames";
import invariant from "tiny-invariant";
import { buttonClasses, cardClasses, selectClasses } from "~/components/Inputs";
import { League } from "~/models/league.server";
import { getPicks, upsertPick } from "~/models/pick.server";
import { getTeams } from "~/models/team.server";
import { requireUserId } from "~/session.server";
import { useMatchesData } from "~/utils";

export const handle = {
  breadcrumb: () => "Your Picks",
};

export const loader = async ({ request, params }: LoaderArgs) => {
  const userId = await requireUserId(request);
  const leagueId = Number(params.leagueId);
  invariant(params.leagueId, "leagueId not found");

  const teams = await getTeams({ leagueId });
  const picks = await getPicks({ leagueId, userId });

  const teamsSortedByRank = teams.sort((a, b) => (a.rank < b.rank ? -1 : 1));

  return json({ teams: teamsSortedByRank, picks });
};

export const action = async ({ request, params }: ActionArgs) => {
  const userId = await requireUserId(request);
  const leagueId = Number(params.leagueId);
  invariant(params.leagueId, "leagueId not found");

  const formData = await request.formData();
  const allTeamIds = formData.getAll("teamId");
  const allPoints = formData.getAll("points");

  try {
    let errors: Record<string, string> = {};

    //VALIDATE FOR DUPLICATE POINTS
    for (let i = 0; i < allTeamIds.length; i++) {
      const teamId = allTeamIds[i] as string;
      const points = allPoints[i];

      const isMultiplePicks =
        allPoints.filter((ap) => ap === points).length > 1;

      if (isMultiplePicks) {
        errors[teamId] = "Please enter a unique point value";
      }
    }

    if (Object.entries(errors).length) {
      return json({ errors });
    }

    for (let i = 0; i < allTeamIds.length; i++) {
      const teamId = allTeamIds[i];
      const points = allPoints[i];

      await upsertPick({
        leagueId,
        userId,
        teamId: Number(teamId),
        points: Number(points) ?? 0,
      });
    }

    return new Response("ok");
  } catch (e) {
    return json(
      {
        error: e instanceof Error ? e.message : "Error updating picks",
      },
      { status: 400 }
    );
  }
};

export default function LeagueEntriesPage() {
  const data = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const { league } = useMatchesData("routes/__app/leagues.$leagueId") as {
    league: League;
  };

  return (
    <div>
      {league.isLocked && (
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
                You are not able to make picks once league is locked.
              </p>
            </div>
          </div>
        </div>
      )}
      <div
        className={classNames("max-w-lg", cardClasses, {
          "mt-4": league.isLocked,
        })}
      >
        <div className="p-6">
          <h2 className="text-lg font-medium leading-6 text-navy">
            Your picks
          </h2>
        </div>
        <Form method="post">
          <fieldset disabled={league.isLocked}>
            <ul className="p-6 border-t border-gray-200">
              {data.teams.length === 0 && (
                <p className="mt-2">There are no picks to be made.</p>
              )}
              {data.teams.map((team) => {
                const myPick = data.picks.find((p) => p.teamId === team.id);
                const pickError =
                  actionData?.errors && actionData?.errors[team.id];

                return (
                  <li key={team.id} className="py-2">
                    <input type="hidden" name="teamId" value={team.id} />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img className="w-10 h-10" src={team.imageUri} />
                        <span>{team.name}</span>
                      </div>
                      <select
                        className={classNames(selectClasses, "w-auto", {
                          "border-red-400": pickError,
                        })}
                        name="points"
                        defaultValue={myPick?.points.toString() ?? ""}
                      >
                        <option value="">Select</option>
                        {Array.from(new Array(data.teams.length)).map(
                          (i, index) => (
                            <option key={index} value={index + 1}>
                              {index + 1}
                            </option>
                          )
                        )}
                      </select>
                    </div>
                    {pickError && (
                      <p className="mt-2 text-right text-red-400">
                        {pickError}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
            <div className="flex justify-end p-6 pt-0">
              <button
                name="intent"
                value="update-picks"
                className={buttonClasses}
              >
                Save
              </button>
            </div>
          </fieldset>
        </Form>
      </div>
    </div>
  );
}

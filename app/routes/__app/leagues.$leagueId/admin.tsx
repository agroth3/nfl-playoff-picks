import { ExclamationCircleIcon } from "@heroicons/react/24/solid";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { ActionArgs, json, LoaderArgs } from "@remix-run/server-runtime";
import classNames from "classnames";
import { useEffect, useRef, useState } from "react";
import invariant from "tiny-invariant";
import {
  buttonClasses,
  cardClasses,
  inputClasses,
  selectClasses,
} from "~/components/Inputs";
import { League, updateLeague } from "~/models/league.server";
import {
  createTeam,
  deleteTeam,
  getTeams,
  Team,
  updateTeam,
} from "~/models/team.server";
import { requireUserId } from "~/session.server";
import { useMatchesData } from "~/utils";

export const handle = {
  breadcrumb: () => "Admin",
};

export const loader = async ({ params }: LoaderArgs) => {
  invariant(params.leagueId, "leagueId not found");

  const teams = await getTeams({ leagueId: Number(params.leagueId) });

  return json({ teams });
};

export const action = async ({ request, params }: ActionArgs) => {
  invariant(params.leagueId, "leagueId not found");

  const formData = await request.formData();
  const intent = formData.get("intent") as string;

  switch (intent) {
    case "add-team": {
      const name = formData.get("name");
      const abbreviation = formData.get("abbreviation");
      const conference = formData.get("conference");
      const imageUri = formData.get("new-imageUri") as string;

      if (typeof name !== "string" || name.length === 0) {
        return json(
          {
            errors: {
              name: "Team name is required",
              abbreviation: null,
              conference: null,
            },
          },
          { status: 400 }
        );
      }
      if (typeof abbreviation !== "string" || abbreviation.length === 0) {
        return json(
          {
            errors: {
              name: null,
              abbreviation: "Team abbreviation is required",
              conference: null,
            },
          },
          { status: 400 }
        );
      }
      if (typeof conference !== "string" || conference === "") {
        return json(
          {
            errors: {
              name: null,
              abbreviation: null,
              conference: "Team conference is required",
            },
          },
          { status: 400 }
        );
      }

      await createTeam({
        leagueId: Number(params.leagueId),
        name,
        abbreviation,
        conference,
        imageUri: imageUri,
      });

      return new Response("ok");
    }

    case "update-league": {
      try {
        const isLocked = formData.get("isLocked") === "on";
        const isArchived = formData.get("isArchived") === "on";

        await updateLeague({
          id: Number(params.leagueId),
          isLocked,
          isArchived,
        });

        const removedTeamIdsString = formData.get("removedTeamIds") as string;
        const removedTeamIds = JSON.parse(removedTeamIdsString) as number[];
        const teamIds = formData.getAll("teamId");
        const ranks = formData.getAll("rank");
        const wins = formData.getAll("wins");
        const names = formData.getAll("teamName");
        const abbreviations = formData.getAll("teamAbbreviation");
        const imageUris = formData.getAll("imageUri");

        for (let i = 0; i < teamIds.length; i++) {
          const teamId = teamIds[i];
          const rank = ranks[i];
          const teamWins = wins[i];
          const name = names[i] as string;
          const abbreviation = abbreviations[i] as string;
          const imageUri = imageUris[i] as string;

          console.log(imageUri);

          await updateTeam({
            id: Number(teamId),
            rank: Number(rank),
            wins: Number(teamWins),
            name,
            abbreviation,
            imageUri,
          });
        }

        if (removedTeamIds.length > 0) {
          for (let i = 0; i < removedTeamIds.length; i++) {
            const teamId = removedTeamIds[i];
            await deleteTeam({ teamId });
          }
        }

        return new Response("ok");
      } catch (e) {
        return json(
          {
            error: e instanceof Error ? e.message : "Error updating league",
          },
          { status: 400 }
        );
      }
    }
    default:
      throw new Error(`Unsupported intent: ${intent}`);
  }
};

export default function LeagueAdminPage() {
  const data = useLoaderData<typeof loader>();
  const { league } = useMatchesData("routes/__app/leagues.$leagueId") as {
    league: League;
  };

  const createTeamFormRef = useRef<HTMLFormElement | null>(null);
  const [removedTeamIds, setRemovedTeamIds] = useState<number[]>([]);
  const fetcher = useFetcher();

  useEffect(() => {
    if (fetcher.type === "done" && fetcher.data === "ok") {
      createTeamFormRef.current?.reset();
    }
  }, [fetcher]);

  const isCreatingTeam =
    fetcher.submission?.formData.get("intent") === "create-team" &&
    fetcher.state === "submitting";
  const isSaving =
    fetcher.submission?.formData.get("intent") === "update-league" &&
    fetcher.state === "submitting";

  const filteredTeams = data.teams.filter(
    (t) => !removedTeamIds.includes(t.id)
  );
  const nfcTeams = filteredTeams.filter((t) => t.conference === "NFC");
  const afcTeams = filteredTeams.filter((t) => t.conference === "AFC");

  return (
    <fetcher.Form method="post" ref={createTeamFormRef}>
      {fetcher.data?.error && (
        <div className="p-4 my-4 bg-red-200 rounded-lg">
          {fetcher.data?.error}
        </div>
      )}
      <input
        type="hidden"
        name="removedTeamIds"
        value={JSON.stringify(removedTeamIds)}
      />
      <div>
        <div className={cardClasses}>
          <div className="p-6">
            <h2 className="text-lg font-medium leading-6 text-navy">
              League Settings
            </h2>
          </div>
          <div className="p-6 border-t border-gray-200">
            <div>
              <label htmlFor="isLocked" className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isLocked"
                  id="isLocked"
                  defaultChecked={league?.isLocked}
                />
                <span>Lock league</span>
              </label>
              <p className="text-sm text-gray-700">
                This will display member picks and prevent members from changing
                their picks
              </p>
            </div>
            <div className="mt-4">
              <label htmlFor="isArchived" className="flex items-center gap-2">
                <input
                  id="isArchived"
                  type="checkbox"
                  name="isArchived"
                  defaultChecked={league?.isArchived}
                />
                <span>Archive league</span>
              </label>
              <p className="text-sm text-gray-700">
                This will prevent the league from showing in list of leagues
              </p>
            </div>
          </div>
        </div>
        <div className="grid-cols-12 gap-8 mt-8 md:grid">
          <div className="col-span-4">
            <div className={`${cardClasses}`}>
              <div className="p-6">
                <h2 className="text-lg font-medium leading-6 text-navy">
                  Create Team
                </h2>
              </div>
              <div className="p-6 border-t border-gray-200">
                <div className="mt-4">
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Name
                  </label>
                  <div className="relative mt-1 rounded-md shadow-sm">
                    <input
                      type="text"
                      name="name"
                      id="name"
                      className={classNames(inputClasses, "w-full", {
                        "border-red-300 pr-10 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500":
                          fetcher.data?.errors?.name,
                      })}
                      aria-describedby="name-error"
                    />
                    {fetcher.data?.errors?.name && (
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <ExclamationCircleIcon
                          className="w-5 h-5 text-red-500"
                          aria-hidden="true"
                        />
                      </div>
                    )}
                  </div>
                  {fetcher.data?.errors?.name && (
                    <p className="mt-2 text-sm text-red-600" id="name-error">
                      {fetcher.data?.errors?.name}
                    </p>
                  )}
                </div>

                <div className="mt-4">
                  <label
                    htmlFor="abbreviation"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Abbreviation
                  </label>
                  <div className="relative mt-1 rounded-md shadow-sm">
                    <input
                      type="text"
                      name="abbreviation"
                      id="abbreviation"
                      className={classNames(inputClasses, "w-full", {
                        "border-red-300 pr-10 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500":
                          fetcher.data?.errors?.abbreviation,
                      })}
                      aria-describedby="abbreviation-error"
                    />
                    {fetcher.data?.errors?.abbreviation && (
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <ExclamationCircleIcon
                          className="w-5 h-5 text-red-500"
                          aria-hidden="true"
                        />
                      </div>
                    )}
                  </div>
                  {fetcher.data?.errors?.abbreviation && (
                    <p
                      className="mt-2 text-sm text-red-600"
                      id="abbreviation-error"
                    >
                      {fetcher.data?.errors?.abbreviation}
                    </p>
                  )}
                </div>

                <div className="mt-4">
                  <label
                    htmlFor="imageUri"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Logo
                  </label>
                  <div className="relative mt-1 rounded-md shadow-sm">
                    <input
                      type="text"
                      name="new-imageUri"
                      id="imageUri"
                      className={classNames(inputClasses, "w-full")}
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label
                    htmlFor="abbreviation"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Conference
                  </label>
                  <div className="relative mt-1 rounded-md shadow-sm">
                    <select
                      id="conference"
                      name="conference"
                      className={selectClasses}
                    >
                      <option value="">select</option>
                      <option value="AFC">AFC</option>
                      <option value="NFC">NFC</option>
                    </select>
                    {fetcher.data?.errors?.conference && (
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <ExclamationCircleIcon
                          className="w-5 h-5 text-red-500"
                          aria-hidden="true"
                        />
                      </div>
                    )}
                  </div>
                  {fetcher.data?.errors?.conference && (
                    <p
                      className="mt-2 text-sm text-red-600"
                      id="conference-error"
                    >
                      {fetcher.data?.errors?.conference}
                    </p>
                  )}
                </div>

                <div className="mt-4 text-right">
                  <button
                    type="submit"
                    name="intent"
                    value="add-team"
                    className={buttonClasses}
                  >
                    Create
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-12 col-span-8 gap-4 p-4 mt-4 md:mt-0 md:pt-0">
            <div
              className={classNames("col-span-12 md:col-span-6", cardClasses)}
            >
              <div className="p-6">
                <h2 className="text-lg font-medium leading-6 text-navy">AFC</h2>
              </div>
              <div className="p-6 border-t border-gray-200">
                {afcTeams.length === 0 && (
                  <div className="mt-2">There are no teams yet</div>
                )}
                <ul className="mt-2 divide-y divide-gray-500">
                  {afcTeams.map((team) => (
                    <TeamListItem
                      onDeleteTeam={() =>
                        setRemovedTeamIds([...removedTeamIds, team.id])
                      }
                      totalTeamsCount={afcTeams.length}
                      team={team}
                      key={team.id}
                    />
                  ))}
                </ul>
              </div>
            </div>
            <div
              className={classNames(
                "col-span-12 mt-4 md:col-span-6 md:mt-0",
                cardClasses
              )}
            >
              <div className="p-6">
                <h2 className="text-lg font-medium leading-6 text-navy">NFC</h2>
              </div>
              <div className="p-6 border-t border-gray-200">
                {nfcTeams.length === 0 && (
                  <div className="mt-2">There are no teams yet</div>
                )}
                <ul className="mt-2 divide-y divide-gray-500">
                  {nfcTeams.map((team) => (
                    <TeamListItem
                      onDeleteTeam={() =>
                        setRemovedTeamIds([...removedTeamIds, team.id])
                      }
                      totalTeamsCount={nfcTeams.length}
                      team={team}
                      key={team.id}
                    />
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-end mt-4">
        <button
          type="submit"
          name="intent"
          value="update-league"
          className={buttonClasses}
        >
          {isSaving ? "Updating" : "Update"}
        </button>
      </div>
    </fetcher.Form>
  );
}

const TeamListItem = ({
  onDeleteTeam,
  totalTeamsCount,
  team,
}: {
  onDeleteTeam: () => void;
  totalTeamsCount: number;
  team: Pick<
    Team,
    "name" | "abbreviation" | "conference" | "id" | "rank" | "wins" | "imageUri"
  >;
}) => {
  return (
    <li className="py-4">
      <input type="hidden" name="teamId" value={team.id} />
      <div className="flex items-center justify-between gap-2">
        <select
          name="rank"
          id={`team[${team.id}][rank]`}
          defaultValue={team.rank.toString()}
          className={selectClasses}
        >
          {Array.from(new Array(totalTeamsCount)).map((i, index) => (
            <option key={index} value={index + 1}>
              {index + 1}
            </option>
          ))}
        </select>
        <input
          className={inputClasses}
          type="text"
          name="teamName"
          defaultValue={team.name}
        />
        <button
          onClick={onDeleteTeam}
          className="px-2 py-1 text-sm text-white bg-red-600 rounded-md"
        >
          delete
        </button>
      </div>
      <div className="mt-2">
        <label
          htmlFor={`team[${team.id}].abbr`}
          className="block text-sm font-medium text-gray-700"
        >
          Abbreviation
        </label>
        <div className="mt-1">
          <input
            type="text"
            name="teamAbbreviation"
            id={`team[${team.id}].abbr`}
            className={inputClasses}
            defaultValue={team.abbreviation}
          />
        </div>
      </div>
      <div className="mt-2">
        <label
          htmlFor={`team[${team.id}].wins`}
          className="block text-sm font-medium text-gray-700"
        >
          Wins
        </label>
        <div className="mt-1">
          <input
            type="number"
            name="wins"
            id={`team[${team.id}][wins]`}
            className={inputClasses}
            defaultValue={team.wins}
          />
        </div>
      </div>
      <div className="mt-2">
        <label
          htmlFor={`team[${team.id}].imageUri`}
          className="block text-sm font-medium text-gray-700"
        >
          Logo
        </label>
        <div className="mt-1">
          <input
            type="text"
            name="imageUri"
            id={`team[${team.id}].imageUri`}
            className={inputClasses}
            defaultValue={team.imageUri ?? ""}
          />
        </div>
      </div>
    </li>
  );
};

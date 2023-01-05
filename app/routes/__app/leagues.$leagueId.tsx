import { PencilIcon } from "@heroicons/react/24/solid";
import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  NavLink,
  Outlet,
  useCatch,
  useFetcher,
  useLoaderData,
} from "@remix-run/react";
import classNames from "classnames";
import invariant from "tiny-invariant";
import {
  deleteLeague,
  deleteLeagueUser,
  getLeague,
} from "~/models/league.server";

import { requireUserId } from "~/session.server";

let tabs = [
  { name: "Leaderboard", href: "details" },
  { name: "Your Picks", href: "entries" },
  { name: "Members", href: "members" },
];

export async function loader({ request, params }: LoaderArgs) {
  const userId = await requireUserId(request);
  invariant(params.leagueId, "leagueId not found");

  const league = await getLeague({ id: Number(params.leagueId), userId });
  if (!league) {
    throw new Response("Not Found", { status: 404 });
  }

  if (league.userId === userId) {
    tabs.push({ name: "Admin", href: "admin" });
  }

  return json({ league, userId, tabs });
}

export async function action({ request, params }: ActionArgs) {
  const userId = await requireUserId(request);
  invariant(params.leagueId, "leagueId not found");

  const formData = await request.formData();
  const intent = formData.get("intent");
  invariant(typeof intent === "string", "intent required");

  switch (intent) {
    case "delete-league":
      await deleteLeague({ leagueId: Number(params.leagueId) });
      return redirect("/leagues");
    case "delete-league-user": {
      const leagueUserId = formData.get("userId") as string;
      invariant(typeof leagueUserId === "string", "league user id is required");

      await deleteLeagueUser({
        userId: leagueUserId,
        leagueId: Number(params.leagueId),
      });

      return new Response("ok");
    }
    default: {
      throw new Error(`Unsupported intent: ${intent}`);
    }
  }
}

export default function LeagueDetailsPage() {
  const data = useLoaderData<typeof loader>();
  const fetcher = useFetcher();

  return (
    <>
      {/* Page heading */}
      <header className="py-8 bg-gray-50">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8 xl:flex xl:items-center xl:justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="mt-2 text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
              {data.league.name}
            </h1>
            <h2>{data.league.hash}</h2>
          </div>
        </div>
      </header>

      <main className="pt-8 pb-16">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="px-4 sm:px-0">
            {/* Tabs */}
            <div className="sm:hidden">
              <label htmlFor="tabs" className="sr-only">
                Select a tab
              </label>
              {/* Use an "onChange" listener to redirect the user to the selected tab URL. */}
              <select
                id="tabs"
                name="tabs"
                className="block w-full py-2 pl-3 pr-10 mt-4 text-base border-gray-300 rounded-md focus:border-purple-500 focus:outline-none focus:ring-purple-500 sm:text-sm"
              >
                {data.tabs.map((tab) => (
                  <option key={tab.name}>{tab.name}</option>
                ))}
              </select>
            </div>
            <div className="hidden sm:block">
              <div className="border-b border-gray-200">
                <nav className="flex mt-2 -mb-px space-x-8" aria-label="Tabs">
                  {data.tabs.map((tab) => (
                    <NavLink
                      key={tab.name}
                      to={tab.href}
                      className={({ isActive }) =>
                        classNames(
                          isActive
                            ? "border-purple-500 text-purple-600"
                            : "border-transparent text-gray-500 hover:border-gray-200 hover:text-gray-700",
                          "whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium"
                        )
                      }
                    >
                      {tab.name}
                    </NavLink>
                  ))}
                </nav>
              </div>
            </div>
          </div>
          <div className="p-4">
            <Outlet />
          </div>
        </div>
      </main>
    </>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);

  return <div>An unexpected error occurred: {error.message}</div>;
}

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 404) {
    return <div>League not found</div>;
  }

  throw new Error(`Unexpected caught response with status: ${caught.status}`);
}

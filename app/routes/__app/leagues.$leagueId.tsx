import {
  ChevronRightIcon,
  ClipboardDocumentIcon,
} from "@heroicons/react/24/solid";
import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { CopyToClipboard } from "react-copy-to-clipboard";
import {
  Link,
  NavLink,
  Outlet,
  useCatch,
  useLoaderData,
  useLocation,
  useMatches,
  useNavigate,
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
  const url = new URL(request.url);
  const baseUrl = url.host;

  const league = await getLeague({ id: Number(params.leagueId), userId });
  if (!league) {
    throw new Response("Not Found", { status: 404 });
  }

  return json({ league, userId, baseUrl });
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
  const matches = useMatches();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <>
      <nav className="relative hidden shadow-md bg-violet-600 bg-gradient-to-br from-violet-600 to-indigo-600 shadow-violet-900/5 md:flex">
        <ol className="flex items-center w-full h-16 px-4 mx-auto space-x-1 overflow-x-auto font-medium text-white max-w-7xl sm:px-8 ">
          <li>
            <Link
              to="/leagues"
              className=" -ml-2 flex items-center rounded-lg bg-transparent py-1.5 pl-2 pr-3 hover:bg-violet-700/50 focus:bg-violet-700/50"
            >
              <svg
                role="img"
                className="w-4 h-auto mr-2 pointer-events-none"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <g bufferred-rendering="static">
                  <path
                    d="M17.5 13a1.947 1.947 0 00-1.928-1.928H13A1.946 1.946 0 0011.072 13v2.572A1.947 1.947 0 0013 17.5h2.572a1.949 1.949 0 001.928-1.928V13z"
                    fillOpacity=".5"
                  ></path>
                  <path d="M8.928 13A1.946 1.946 0 007 11.072H4.428A1.947 1.947 0 002.5 13v2.572A1.949 1.949 0 004.428 17.5H7a1.947 1.947 0 001.928-1.928V13zM17.5 4.428A1.949 1.949 0 0015.572 2.5H13a1.947 1.947 0 00-1.928 1.928V7A1.946 1.946 0 0013 8.928h2.572A1.947 1.947 0 0017.5 7V4.428zm-8.572 0A1.947 1.947 0 007 2.5H4.428A1.949 1.949 0 002.5 4.428V7a1.947 1.947 0 001.928 1.928H7A1.946 1.946 0 008.928 7V4.428z"></path>
                </g>
              </svg>
              Dashboard
            </Link>
          </li>
          <li className="flex items-center">
            <ChevronRightIcon className="w-5 h-5 mr-1 opacity-50" />
            <span className="cursor-default px-3 py-1.5">
              {data.league.name}
            </span>
          </li>
          {matches
            // skip routes that don't have a breadcrumb
            .filter((match) => match.handle && match.handle.breadcrumb)
            // render breadcrumbs!
            .map((match, index) => (
              <li className="flex items-center" key={index}>
                <ChevronRightIcon className="w-5 h-5 mr-1 opacity-50" />
                <span className="cursor-default px-3 py-1.5">
                  {match.handle?.breadcrumb(match)}
                </span>
              </li>
            ))}
        </ol>
      </nav>
      {/* Page heading */}
      <header className="py-8 bg-gray-50">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8 xl:flex xl:items-center xl:justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="mt-2 text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
              {data.league.name}
            </h1>

            <button className="mt-2 inline-flex items-center rounded border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
              <CopyToClipboard
                text={`${data.baseUrl}/leagues/join?lid=${data.league.hash}`}
              >
                <span className="flex gap-2">
                  <ClipboardDocumentIcon className="w-4 h-4" />
                  Copy league join link
                </span>
              </CopyToClipboard>
            </button>
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
                onChange={(e) => navigate(e.target.value)}
                value={
                  tabs.find((t) => location.pathname.includes(t.href))?.href
                }
              >
                {tabs.map((tab) => (
                  <option key={tab.href} value={tab.href}>
                    {tab.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="hidden sm:block">
              <div className="border-b border-gray-200">
                <nav className="flex mt-2 -mb-px space-x-8" aria-label="Tabs">
                  {tabs.map((tab) => (
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
                  {data.userId === data.league.userId && (
                    <NavLink
                      to="admin"
                      className={({ isActive }) =>
                        classNames(
                          isActive
                            ? "border-purple-500 text-purple-600"
                            : "border-transparent text-gray-500 hover:border-gray-200 hover:text-gray-700",
                          "whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium"
                        )
                      }
                    >
                      Admin
                    </NavLink>
                  )}
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

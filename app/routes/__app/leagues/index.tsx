import { Form, Link, NavLink, Outlet, useLoaderData } from "@remix-run/react";
import { json, LoaderArgs } from "@remix-run/server-runtime";
import { getLeagueListItems } from "~/models/league.server";
import { requireUserId } from "~/session.server";

export async function loader({ request }: LoaderArgs) {
  const userId = await requireUserId(request);
  const leagueListItems = await getLeagueListItems({ userId });

  return json({ leagueListItems });
}

export default function LeaguesPage() {
  const data = useLoaderData<typeof loader>();

  return (
    <main className="w-full mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div>
        <div className="flex justify-end gap-4 my-4">
          <Link
            to="new"
            className="inline-flex items-center rounded border border-transparent bg-indigo-100 px-2.5 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Create league
          </Link>
          <Link
            to="join"
            className="inline-flex items-center rounded border border-transparent bg-indigo-100 px-2.5 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Join league
          </Link>
        </div>
      </div>
      <h4 className="mt-2 text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
        My Pools
      </h4>
      <div className="grid grid-cols-12 gap-4 mt-4">
        {data.leagueListItems.map((league) => (
          <NavLink
            to={league.league.id.toString()}
            key={league.league.id}
            className="relative col-span-6 p-4 transition duration-100 rounded-lg shadow-md hover:shadow-xl"
          >
            {league.league.name}
          </NavLink>
        ))}
      </div>
    </main>
  );
}

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
    <div className="flex flex-col h-full min-h-screen">
      <header className="flex items-center justify-between p-4 text-white bg-slate-800">
        <h1 className="text-3xl font-bold">
          <Link to=".">Leagues</Link>
        </h1>
        <Form action="/logout" method="post">
          <button
            type="submit"
            className="px-4 py-2 text-blue-100 rounded bg-slate-600 hover:bg-blue-500 active:bg-blue-600"
          >
            Logout
          </button>
        </Form>
      </header>

      <main className="flex h-full bg-white">
        <div className="flex-1 p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

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
      <main className="flex h-full bg-white">
        {data.leagueListItems.length === 0 ? (
          <div className="flex flex-col items-center mx-auto">
            <p>You are not a member of any leagues yet</p>
            <div className="flex gap-4">
              <Link to="new">Create league</Link>
              <Link to="join">Join league</Link>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex gap-4">
              <Link to="new">Create league</Link>
              <Link to="join">Join league</Link>
            </div>
            <ol>
              {data.leagueListItems.map((league) => (
                <li key={league.league.id}>
                  <NavLink
                    className={({ isActive }) =>
                      `block border-b p-4 text-xl ${isActive ? "bg-white" : ""}`
                    }
                    to={league.league.id.toString()}
                  >
                    📝 {league.league.name}
                  </NavLink>
                </li>
              ))}
            </ol>
          </div>
        )}
      </main>
    </div>
  );
}

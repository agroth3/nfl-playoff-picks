import { Link, useCatch, useLoaderData } from "@remix-run/react";
import { json, LoaderArgs } from "@remix-run/server-runtime";
import { getLeagueByHash, joinLeague } from "~/models/league.server";
import { requireUserId } from "~/session.server";

export const loader = async ({ request, params }: LoaderArgs) => {
  await requireUserId(request);
  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.searchParams);
  const hash = searchParams.get("lid");

  if (!hash) {
    throw new Response("Hash Not Found", { status: 404 });
  }

  const league = await getLeagueByHash({ hash });

  if (!league) {
    throw new Response("League Not Found", { status: 404 });
  }

  return json({ hash, league });
};

export default function JoinLeaguePage() {
  const data = useLoaderData<typeof loader>();

  return (
    <div>
      <h2>join league</h2>
      <p>{data.hash}</p>
      <pre>{JSON.stringify(data.league, null, 2)}</pre>
    </div>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);

  return <div>An unexpected error occurred: {error.message}</div>;
}

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 404) {
    return (
      <div className="mt-8 text-center">
        <h3 className="text-xl">League not found</h3>
        <p>
          Please{" "}
          <Link to="/leagues/join" className="text-blue-500 underline">
            join
          </Link>{" "}
          a league
        </p>
      </div>
    );
  }

  throw new Error(`Unexpected caught response with status: ${caught.status}`);
}

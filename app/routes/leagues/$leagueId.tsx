import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useCatch, useFetcher, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import {
  deleteLeague,
  deleteLeagueUser,
  getLeague,
} from "~/models/league.server";

import { deleteNote, getNote } from "~/models/note.server";
import { requireUserId } from "~/session.server";

export async function loader({ request, params }: LoaderArgs) {
  const userId = await requireUserId(request);
  invariant(params.leagueId, "leagueId not found");

  const league = await getLeague({ userId, id: Number(params.leagueId) });
  if (!league) {
    throw new Response("Not Found", { status: 404 });
  }
  return json({ league, userId });
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
    <div>
      <h3 className="text-2xl font-bold">{data.league.name}</h3>
      <h4>{data.league.hash}</h4>
      <hr className="my-4" />
      <h4>Members</h4>
      <ul className="space-y-4 divide-y divide-gray-200">
        {data.league.users.map((user) => (
          <li key={user.user.id} data-testId="league-member-list-item">
            <p>{user.user.email}</p>
            {data.league.userId !== data.userId && (
              <fetcher.Form method="post">
                <input type="hidden" name="userId" value={user.user.id} />
                <button
                  name="intent"
                  value="delete-league-user"
                  type="submit"
                  className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 focus:bg-blue-400"
                >
                  Delete
                </button>
              </fetcher.Form>
            )}
          </li>
        ))}
      </ul>
      {data.league.userId === data.userId && (
        <Form method="post">
          <button
            name="intent"
            value="delete-league"
            type="submit"
            className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 focus:bg-blue-400"
          >
            Delete
          </button>
        </Form>
      )}
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
    return <div>League not found</div>;
  }

  throw new Error(`Unexpected caught response with status: ${caught.status}`);
}

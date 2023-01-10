import { ExclamationCircleIcon } from "@heroicons/react/24/solid";
import { Form, useActionData, useCatch, useLoaderData } from "@remix-run/react";
import {
  ActionArgs,
  json,
  LoaderArgs,
  redirect,
} from "@remix-run/server-runtime";
import { requireUserId } from "~/session.server";
import {
  getLeagueByHash,
  joinLeague,
  League,
  verifyLeaguePassword,
} from "~/models/league.server";
import classNames from "classnames";

export const loader = async ({ request }: LoaderArgs) => {
  await requireUserId(request);
  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.searchParams);
  const hash = searchParams.get("lid");

  let league: League | null = null;
  if (hash) {
    league = await getLeagueByHash({ hash });
  }

  if (hash && !league) {
    return redirect("/leagues/join");
  }

  return json({ league });
};

export async function action({ request }: ActionArgs) {
  const userId = await requireUserId(request);

  const formData = await request.formData();
  const hash = formData.get("hash");
  const password = formData.get("password");

  if (typeof hash !== "string" || hash.length === 0) {
    return json(
      { errors: { hash: "League ID is required", password: null } },
      { status: 400 }
    );
  }

  if (typeof password !== "string" || password.length === 0) {
    return json(
      { errors: { password: "Password is required", hash: null } },
      { status: 400 }
    );
  }

  if (typeof password !== "string" || password.length < 8) {
    return json(
      {
        errors: {
          password: "Password must be at least 8 characters",
          hash: null,
        },
      },
      { status: 400 }
    );
  }

  const league = await verifyLeaguePassword(hash, password);

  if (!league) {
    return json(
      { errors: { password: "Invalid id or password", hash: null } },
      { status: 400 }
    );
  }

  const joinedLeague = await joinLeague({ hash, userId });

  if (!joinedLeague) {
    return json(
      { errors: { hash: "Error joining league", password: null } },
      { status: 400 }
    );
  }

  return redirect(`/leagues/${joinedLeague.leagueId}`);
}

export default function JoinLeaguePage() {
  const data = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <main className="w-full px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <Form method="post" className="max-w-lg mx-auto mt-4">
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          {data?.league
            ? `Enter password for ${data.league.name}`
            : "Join league"}
        </h3>
        {data.league ? (
          <input type="hidden" name="hash" value={data.league.hash} />
        ) : (
          <div className="mt-4">
            <label
              htmlFor="hash"
              className="block text-sm font-medium text-gray-700"
            >
              League ID
            </label>
            <div className="relative mt-1 rounded-md shadow-sm">
              <input
                type="text"
                name="hash"
                id="hash"
                className={classNames(
                  "block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm",
                  {
                    "border-red-300 pr-10 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500":
                      actionData?.errors?.hash,
                  }
                )}
                aria-describedby="id-error"
              />
              {actionData?.errors?.hash && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <ExclamationCircleIcon
                    className="w-5 h-5 text-red-500"
                    aria-hidden="true"
                  />
                </div>
              )}
            </div>
            {actionData?.errors.hash && (
              <p className="mt-2 text-sm text-red-600" id="name-error">
                {actionData?.errors?.hash}
              </p>
            )}
          </div>
        )}
        <div className="mt-4">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <div className="relative mt-1 rounded-md shadow-sm">
            <input
              type="text"
              name="password"
              id="password"
              className={classNames(
                "block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm",
                {
                  "border-red-300 pr-10 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500":
                    actionData?.errors?.password,
                }
              )}
              aria-describedby="password-error"
            />
            {actionData?.errors?.password && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <ExclamationCircleIcon
                  className="w-5 h-5 text-red-500"
                  aria-hidden="true"
                />
              </div>
            )}
          </div>
          <p className="mt-2 text-sm text-gray-500" id="password-description">
            Minimum of 8 characters
          </p>
          {actionData?.errors.password && (
            <p className="mt-2 text-sm text-red-600" id="password-error">
              {actionData?.errors?.password}
            </p>
          )}
        </div>

        <div className="mt-4 text-right">
          <button
            type="submit"
            className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 focus:bg-blue-400"
          >
            Save
          </button>
        </div>
      </Form>
    </main>
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
      </div>
    );
  }

  throw new Error(`Unexpected caught response with status: ${caught.status}`);
}

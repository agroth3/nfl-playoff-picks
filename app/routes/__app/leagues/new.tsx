import { ExclamationCircleIcon } from "@heroicons/react/24/solid";
import { Form, useActionData } from "@remix-run/react";
import { ActionArgs, json, redirect } from "@remix-run/server-runtime";
import { requireUserId } from "~/session.server";
import { createLeague } from "~/models/league.server";
import classNames from "classnames";

export async function action({ request }: ActionArgs) {
  const userId = await requireUserId(request);

  const formData = await request.formData();
  const name = formData.get("name");
  const password = formData.get("password");

  if (typeof name !== "string" || name.length === 0) {
    return json(
      { errors: { name: "Name is required", password: null } },
      { status: 400 }
    );
  }

  if (typeof password !== "string" || password.length === 0) {
    return json(
      { errors: { password: "Password is required", name: null } },
      { status: 400 }
    );
  }

  if (typeof password !== "string" || password.length < 8) {
    return json(
      {
        errors: {
          password: "Password must be at least 8 characters",
          name: null,
        },
      },
      { status: 400 }
    );
  }

  const league = await createLeague({ name, password, userId });

  return redirect(`/leagues/${league.id}`);
}

export default function NewLeaguePage() {
  const actionData = useActionData<typeof action>();

  return (
    <Form method="post" className="max-w-lg mx-auto">
      <h3 className="text-lg font-medium leading-6 text-gray-900">
        Create league
      </h3>
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
            className={classNames(
              "block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm",
              {
                "border-red-300 pr-10 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500":
                  actionData?.errors?.name,
              }
            )}
            aria-describedby="name-error"
          />
          {actionData?.errors?.name && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <ExclamationCircleIcon
                className="w-5 h-5 text-red-500"
                aria-hidden="true"
              />
            </div>
          )}
        </div>
        {actionData?.errors.name && (
          <p className="mt-2 text-sm text-red-600" id="name-error">
            {actionData?.errors?.name}
          </p>
        )}
      </div>
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
  );
}

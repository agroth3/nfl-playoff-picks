import { ExclamationCircleIcon } from "@heroicons/react/24/solid";
import {
  Form,
  useActionData,
  useLoaderData,
  useTransition,
} from "@remix-run/react";
import {
  ActionArgs,
  json,
  LoaderArgs,
  redirect,
} from "@remix-run/server-runtime";
import classNames from "classnames";
import { cardClasses } from "~/components/Inputs";
import { updateUser } from "~/models/user.server";
import { requireUser, requireUserId } from "~/session.server";

export const loader = async ({ request }: LoaderArgs) => {
  const user = await requireUser(request);

  return json({ user });
};

export const action = async ({ request }: ActionArgs) => {
  const userId = await requireUserId(request);

  const formData = await request.formData();
  const firstName = formData.get("firstName");
  const lastName = formData.get("lastName");

  if (typeof firstName !== "string" || firstName.length === 0) {
    return json(
      { errors: { firstName: "First name is required", lastName: null } },
      { status: 400 }
    );
  }

  if (typeof lastName !== "string" || lastName.length === 0) {
    return json(
      { errors: { firstName: null, lastName: "Last name is required" } },
      { status: 400 }
    );
  }

  await updateUser({ id: userId, firstName, lastName });

  return redirect("/leagues");
};

export default function UserProfilePage() {
  const data = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const transition = useTransition();

  return (
    <main className="w-full px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <Form
        method="post"
        className={classNames("mx-auto mt-4 max-w-lg", cardClasses)}
      >
        <div className="p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Update Profile
          </h3>
        </div>
        <div className="p-6 border-t border-gray-200">
          <div className="mt-4">
            <label
              htmlFor="firstName"
              className="block text-sm font-medium text-gray-700"
            >
              First name
            </label>
            <div className="relative mt-1 rounded-md shadow-sm">
              <input
                type="text"
                name="firstName"
                id="firstName"
                defaultValue={data.user.firstName}
                className={classNames(
                  "block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm",
                  {
                    "border-red-300 pr-10 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500":
                      actionData?.errors?.firstName,
                  }
                )}
                aria-describedby="firstName-error"
              />
              {actionData?.errors?.firstName && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <ExclamationCircleIcon
                    className="w-5 h-5 text-red-500"
                    aria-hidden="true"
                  />
                </div>
              )}
            </div>
            {actionData?.errors?.firstName && (
              <p className="mt-2 text-sm text-red-600" id="firstName-error">
                {actionData?.errors?.firstName}
              </p>
            )}
          </div>

          <div className="mt-4">
            <label
              htmlFor="lastName"
              className="block text-sm font-medium text-gray-700"
            >
              Last name
            </label>
            <div className="relative mt-1 rounded-md shadow-sm">
              <input
                type="text"
                name="lastName"
                id="lastName"
                defaultValue={data.user.lastName}
                className={classNames(
                  "block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm",
                  {
                    "border-red-300 pr-10 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500":
                      actionData?.errors?.lastName,
                  }
                )}
                aria-describedby="lastName-error"
              />
              {actionData?.errors?.lastName && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <ExclamationCircleIcon
                    className="w-5 h-5 text-red-500"
                    aria-hidden="true"
                  />
                </div>
              )}
            </div>
            {actionData?.errors?.lastName && (
              <p className="mt-2 text-sm text-red-600" id="lastName-error">
                {actionData?.errors?.lastName}
              </p>
            )}
          </div>

          <div className="mt-4 text-right">
            <button
              type="submit"
              className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 focus:bg-blue-400"
            >
              {transition.state === "submitting" ? "Saving" : "Save"}
            </button>
          </div>
        </div>
      </Form>
    </main>
  );
}

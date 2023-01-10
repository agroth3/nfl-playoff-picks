import { LoaderArgs, redirect } from "@remix-run/server-runtime";
import { requireUserId } from "~/session.server";

export const loader = async ({ request }: LoaderArgs) => {
  await requireUserId(request);

  return redirect("/leagues");
};

import { useLoaderData } from "@remix-run/react";
import { json, LoaderArgs } from "@remix-run/server-runtime";
import { cardClasses } from "~/components/Inputs";
import { getLeagueMembers } from "~/models/league.server";
import { requireUserId } from "~/session.server";

export const handle = {
  breadcrumb: () => "Members",
};

export const loader = async ({ request, params }: LoaderArgs) => {
  const leagueId = Number(params.leagueId);

  const leagueMembers = await getLeagueMembers({ id: leagueId });

  return json({ leagueMembers });
};

export default function LeagueMembersPage() {
  const data = useLoaderData<typeof loader>();

  return (
    <div className={cardClasses}>
      <div className="p-6">
        <h2 className="text-lg font-medium leading-6 text-navy">
          League Members
        </h2>
      </div>
      <div className="p-6 border-t border-gray-200">
        <div className="flex flex-col">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <table className="min-w-full divide-y divide-gray-300">
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 px-3 text-left text-sm font-semibold text-gray-900"
                    >
                      First name
                    </th>
                    <th
                      scope="col"
                      className="py-3.5 px-3 text-left text-sm font-semibold text-gray-900"
                    >
                      Last name
                    </th>
                    <th
                      scope="col"
                      className="py-3.5 px-3 text-left text-sm font-semibold text-gray-900"
                    >
                      Date joined
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data.leagueMembers.map((m, personIdx) => (
                    <tr
                      key={m.user.id}
                      className={personIdx % 2 === 0 ? undefined : "bg-gray-50"}
                    >
                      <td className="px-3 py-4 text-sm text-gray-500 whitespace-nowrap">
                        {m.user.firstName}
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-500 whitespace-nowrap">
                        {m.user.lastName}
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-500 whitespace-nowrap">
                        {new Date(m.user.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { Dialog, Transition } from "@headlessui/react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/solid";
import { League } from "@prisma/client";
import {
  Form,
  Link,
  Outlet,
  useActionData,
  useLoaderData,
} from "@remix-run/react";
import { ActionArgs, json, LoaderArgs } from "@remix-run/server-runtime";
import { Fragment, useEffect, useRef, useState } from "react";
import { cardClasses } from "~/components/Inputs";
import { getLeagueMembers } from "~/models/league.server";
import { requireUserId } from "~/session.server";
import { useMatchesData } from "~/utils";

export const handle = {
  breadcrumb: () => "Members",
};

export const loader = async ({ request, params }: LoaderArgs) => {
  const userId = await requireUserId(request);
  const leagueId = Number(params.leagueId);

  const leagueMembers = await getLeagueMembers({ id: leagueId });

  return json({
    userId,
    leagueMembers: leagueMembers.map((lm) => ({
      ...lm.user,
      createdAt: lm.user.createdAt.toLocaleDateString(),
      updatedAt: lm.user.updatedAt.toDateString(),
    })),
  });
};

export default function LeagueMembersPage() {
  const data = useLoaderData<typeof loader>();
  const { league } = useMatchesData("routes/__app/leagues.$leagueId") as {
    league: League;
  };

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
                  {data.leagueMembers.map((m) => (
                    <MemberListItem
                      isAdmin={league.userId === data.userId}
                      member={m}
                      key={m.id}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <Outlet />
    </div>
  );
}

function MemberListItem({
  isAdmin,
  member,
}: {
  isAdmin: boolean;
  member: {
    createdAt: string;
    updatedAt: string;
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}) {
  return (
    <>
      <tr>
        <td className="px-3 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
          {member.firstName}
        </td>
        <td className="px-3 py-4 text-sm text-gray-500 whitespace-nowrap">
          {member.lastName}
        </td>
        <td className="px-3 py-4 text-sm text-gray-500 whitespace-nowrap">
          {member.createdAt}
        </td>
        {isAdmin && (
          <td className="relative py-4 pl-3 pr-4 text-sm font-medium text-right whitespace-nowrap sm:pr-6 md:pr-0">
            <Link to={`${member.id}/delete`}>
              <button className="text-red-600 hover:text-red-900">
                Delete<span className="sr-only">, {member.firstName}</span>
              </button>
            </Link>
          </td>
        )}
      </tr>
    </>
  );
}

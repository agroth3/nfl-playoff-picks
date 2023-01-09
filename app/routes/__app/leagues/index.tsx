import { UsersIcon } from "@heroicons/react/24/solid";
import { Form, Link, NavLink, Outlet, useLoaderData } from "@remix-run/react";
import { json, LoaderArgs } from "@remix-run/server-runtime";
import { getLeagueListItems } from "~/models/league.server";
import { requireUserId } from "~/session.server";

export async function loader({ request }: LoaderArgs) {
  const userId = await requireUserId(request);
  const leagueListItems = await getLeagueListItems({ userId });

  return json({
    leagueListItems: leagueListItems.filter(
      (l) => l.league.isArchived === false
    ),
  });
}

export default function LeaguesPage() {
  const data = useLoaderData<typeof loader>();

  return (
    <main className="w-full px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div>
        <div className="flex justify-end gap-4 my-4">
          <Link
            to="new"
            className="inline-flex items-center rounded border border-transparent bg-violet-100 px-2.5 py-1.5 text-xs font-medium text-violet-700 hover:bg-violet-200 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
          >
            Create league
          </Link>
          <Link
            to="join"
            className="inline-flex items-center rounded border border-transparent bg-violet-100 px-2.5 py-1.5 text-xs font-medium text-violet-700 hover:bg-violet-200 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
          >
            Join league
          </Link>
        </div>
      </div>
      <h4 className="mt-2 text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
        My Pools
      </h4>
      <div className="grid grid-cols-12 gap-4 mt-4">
        {data.leagueListItems.map((league) => (
          <NavLink
            to={league.league.id.toString()}
            key={league.league.id}
            className="col-span-12 p-6 bg-white shadow-md rounded-xl shadow-violet-900/5 md:col-span-4"
          >
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-violet-500">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M11.5 0.75C7.38432 0.75 4.46285 2.75418 2.64207 5.14396C0.879731 7.45703 0.0712728 10.2355 0.250124 12.0532C0.258879 13.9472 0.733983 15.5668 1.27369 16.7811C1.80952 17.9868 2.43466 18.8489 2.7929 19.2071C2.98043 19.3946 3.23479 19.5 3.5 19.5H5.74087L10.0144 21.8742C10.027 21.8812 10.0398 21.8879 10.0528 21.8944C10.5412 22.1386 11.1025 22.1706 11.5974 22.0877C12.1049 22.0027 12.6292 21.784 13.0753 21.4212C14.0349 20.6408 14.4931 19.317 13.9487 17.6838C13.8375 17.3503 13.7336 17.0395 13.6365 16.75H15.1091C15.2333 17.3705 15.3707 18.0279 15.5238 18.7169C15.9618 20.6877 17.0033 21.8362 18.3646 22.4272C19.6278 22.9756 21.0813 22.9987 22.2488 23.0002C23.0802 23.0013 23.75 22.3265 23.75 21.5V16.5C23.75 15.5335 22.9665 14.75 22 14.75H16.7598C16.6881 14.3661 16.6214 14.0016 16.5588 13.6581L16.5204 13.4473C16.3998 12.7856 16.2909 12.1879 16.1872 11.6838C18.3232 11.3902 20.7359 11.1188 21.8604 10.9939C22.1414 10.9627 22.396 10.814 22.5612 10.5847C22.7265 10.3554 22.787 10.0669 22.7278 9.79048C21.9155 5.99969 18.6262 0.75 11.5 0.75ZM14.2062 11.9795L14.1644 11.9864C13.0862 12.1661 12.7083 12.5256 12.5766 12.719C12.4375 12.9234 12.44 13.1367 12.4701 13.2575C12.5002 13.3775 12.606 13.6988 12.8543 14.4327L12.962 14.7507C12.9746 14.7502 12.9873 14.75 13 14.75H14.7256C14.6786 14.4954 14.6339 14.2509 14.5912 14.0169L14.5725 13.9144C14.4272 13.1177 14.3098 12.4738 14.2062 11.9795ZM2.24388 11.8896C2.11236 10.7058 2.68054 8.39356 4.23293 6.35604C5.74549 4.37082 8.11568 2.75 11.5 2.75C16.7378 2.75 19.4603 6.12963 20.4762 9.13705C18.6405 9.34676 15.7771 9.69002 13.8356 10.0136C12.4138 10.2506 11.4583 10.8078 10.9234 11.5935C10.3959 12.3683 10.3934 13.1966 10.5299 13.7425C10.5853 13.9644 10.7295 14.3932 10.9598 15.0737L11.0794 15.4268L11.0794 15.4269C11.3122 16.1142 11.6295 17.0508 12.0513 18.3162C12.3584 19.2374 12.0666 19.6637 11.8133 19.8696C11.653 20 11.4551 20.0836 11.267 20.1151C11.1749 20.1306 11.0961 20.1316 11.0362 20.1251C11.0069 20.122 10.9845 20.1173 10.969 20.113C10.9626 20.1112 10.9577 20.1096 10.9542 20.1083L6.48564 17.6258C6.33708 17.5433 6.16994 17.5 6 17.5H3.96854C3.74382 17.193 3.41444 16.6734 3.10131 15.9689C2.64607 14.9446 2.25 13.5831 2.25 12C2.25 11.9631 2.24796 11.9262 2.24388 11.8896ZM21.75 17.85H17.3811C17.2993 17.4728 17.2223 17.1059 17.1496 16.75H21.75V17.85ZM18.1677 19.85H21.75V20.9962C20.7486 20.9796 19.8743 20.9022 19.161 20.5926C18.7982 20.4351 18.4571 20.2082 18.1677 19.85ZM8.375 17.15C9.13439 17.15 9.75 16.5344 9.75 15.775C9.75 15.0156 9.13439 14.4 8.375 14.4C7.61561 14.4 7 15.0156 7 15.775C7 16.5344 7.61561 17.15 8.375 17.15Z"
                    fill="#fff"
                  ></path>
                </svg>
              </div>
              <div>
                <p className="text-lg font-medium">{league.league.name}</p>
                <p className="text-xs text-gray-500">
                  created by: {league.league.user.firstName}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-4 mt-4 border-t border-gray-200">
              <UsersIcon className="w-5 h-5 mr-1" />
              {league.league.users.length}
            </div>
          </NavLink>
        ))}
      </div>
    </main>
  );
}

import type { LinksFunction, LoaderFunctionArgs } from "react-router";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useRouteError,
} from "react-router";

import { getUser } from "~/session.server";
import stylesheet from "~/tailwind.css?url";

import Index from "./routes/_index";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  return { user: await getUser(request) };
};

export default function App() {
  return (
    <html lang="en" className="h-full">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="relative min-h-full">
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <div
          id="overlay"
          className="pointer-events-none fixed bottom-0 left-0 right-0 top-0 z-10 h-full w-full overflow-hidden"
        ></div>
      </body>
    </html>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  return (
    <html lang="en" className="h-full">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="relative min-h-full">
        <Index
          error={
            isRouteErrorResponse(error) ? (
              <div>
                Error {error.status}: {error.statusText}
              </div>
            ) : (
              "Something went wrong on the server. Please try again later."
            )
          }
        />
        <ScrollRestoration />
        <Scripts />
        <div
          id="overlay"
          className="pointer-events-none fixed bottom-0 left-0 right-0 top-0 z-30 h-full w-full overflow-hidden"
        ></div>
      </body>
    </html>
  );
}

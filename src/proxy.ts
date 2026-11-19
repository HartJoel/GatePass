import { auth } from "@/server/auth/auth";

// Cookie-presence route protection only — this never reads the database. Each page/action/
// handler still re-checks via getActor()/authorize*, since a present cookie only means a
// session MIGHT exist (see the gatepass-auth skill).
export default auth.middleware({
  loginUrl: "/sign-in",
  publicRoutes: [
    "/",
    "/sign-in",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/accept-invite",
  ],
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

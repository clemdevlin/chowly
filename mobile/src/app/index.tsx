import { Redirect } from "expo-router";

import { SessionLoading } from "@/components/session-boundary";
import { useSession } from "@/features/auth/use-session";

/**
 * Entry point. Decides the first screen from the stored token and /auth/me:
 * signed out -> welcome, driver -> the rider queue, customer without an address
 * -> location, otherwise the customer home.
 */
export default function Index() {
  const { isResolving, isSignedIn, landingRoute, user } = useSession();

  console.log("Index - isResolving:", isResolving);
  console.log("Index - isSignedIn:", isSignedIn);
  console.log("Index - landingRoute:", landingRoute);
  console.log("Index - user:", user);

  if (isResolving) return <SessionLoading />;
  if (!isSignedIn) return <Redirect href="/welcome" />;

  return <Redirect href={landingRoute} />;
}

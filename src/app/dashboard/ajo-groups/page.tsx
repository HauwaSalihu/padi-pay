import { redirect } from "next/navigation";

/**
 * Legacy route: the Ajo Groups view now lives inside the merged
 * `/dashboard/ajo` page (Groups tab).
 */
export default function AjoGroupsRedirectPage() {
  redirect("/dashboard/ajo?tab=groups");
}

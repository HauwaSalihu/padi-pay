import { redirect } from "next/navigation";

/**
 * Legacy route: the Ajo Applications view now lives inside the merged
 * `/dashboard/ajo` page (Applications tab).
 */
export default function AjoApplicationsRedirectPage() {
  redirect("/dashboard/ajo?tab=applications");
}

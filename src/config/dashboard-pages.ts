/**
 * Centralized registry of admin dashboard pages.
 *
 * This file is the single source of truth for the feature `pageKey` identifiers
 * that are stored in the `AdminPermission` database table. The `pageKey` values
 * here MUST exactly match the string keys stored in the database and consumed by
 * the backend page-restriction logic.
 */

export interface DashboardPageConfig {
  /** Unique page key. Must exactly match the string keys stored in the database. */
  pageKey: string;
  /** Human-readable display text for tags and navigation links. */
  label: string;
  /** Short functional text describing what the page handles. */
  description: string;
}

export const AVAILABLE_DASHBOARD_PAGES: DashboardPageConfig[] = [
  {
    pageKey: "dashboard",
    label: "Dashbord",
    description: "",
  },
  {
    pageKey: "transactions",
    label: "Transactions",
    description: "",
  },
  {
    pageKey: "ajo",
    label: "Ajo Applications",
    description: "",
  },
  {
    pageKey: "ajo-groups",
    label: "Ajo Groups",
    description: ""
  },
  {
    pageKey: "adashe-groups",
    label: "Adashe Groups",
    description: ""
  },

  {
    pageKey: "fixed-savings",
    label: "Fixed Savings",
    description: ""
  },

  {
    pageKey: "target-savings",
    label: "Target Savings",
    description: ""
  },
  {
    pageKey: "spend-and-sabe",
    label: "Spend and Save",
    description: ""
  },
  {
    pageKey: "settings",
    label: "Settings",
    description: "",
  },
];
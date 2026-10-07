import { IconType } from "react-icons";
import {
  HiOutlineHome,
  HiOutlineCreditCard,
  HiOutlineCog,
} from "react-icons/hi";
import { MdGroups2, MdSavings } from "react-icons/md";
import { TbTargetArrow } from "react-icons/tb";
import { GrMoney } from "react-icons/gr";

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
  /** URL path for the page */
  href: string;
  /** Icon component for the page */
  icon: IconType;
}

export const AVAILABLE_DASHBOARD_PAGES: DashboardPageConfig[] = [
  {
    pageKey: "dashboard",
    label: "Dashboard",
    description: "",
    href: "/dashboard",
    icon: HiOutlineHome,
  },
  {
    pageKey: "transactions",
    label: "Transactions",
    description: "",
    href: "/dashboard/transactions",
    icon: HiOutlineCreditCard,
  },
  {
    pageKey: "ajo",
    label: "Ajo",
    description: "",
    href: "/dashboard/ajo",
    icon: MdGroups2,
  },
  {
    pageKey: "adashe",
    label: "Adashe Groups",
    description: "",
    href: "/dashboard/adashe-groups",
    icon: MdGroups2,
  },
  {
    pageKey: "fixed-savings",
    label: "Fixed Savings",
    description: "",
    href: "/dashboard/fixed-savings",
    icon: MdSavings,
  },
  {
    pageKey: "target-savings",
    label: "Target Savings",
    description: "",
    href: "/dashboard/target-savings",
    icon: TbTargetArrow,
  },
  {
    pageKey: "spend-and-save",
    label: "Spend and Save",
    description: "",
    href: "/dashboard/spend-and-save",
    icon: GrMoney,
  },
  {
    pageKey: "settings",
    label: "Settings",
    description: "",
    href: "/dashboard/settings",
    icon: HiOutlineCog,
  },
];
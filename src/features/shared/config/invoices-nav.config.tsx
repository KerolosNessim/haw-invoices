import { FileSignature, FileText, LayoutDashboard } from "lucide-react"
import type { LucideIcon } from "lucide-react"

export type NavLinkDef = {
  href: string
  titleKey: string
  icon: LucideIcon
}

export const INVOICES_HOME_LINK: NavLinkDef = {
  href: "/",
  titleKey: "home",
  icon: LayoutDashboard,
}

export const INVOICES_NAV_LINKS: NavLinkDef[] = [
  INVOICES_HOME_LINK,
  {
    href: "/invoices",
    titleKey: "invoices",
    icon: FileText,
  },
  {
    href: "/contracts",
    titleKey: "contracts",
    icon: FileSignature,
  },
]

export function routeMatches(href: string, pathname: string): boolean {
  if (href === "/") return pathname === "/"
  return pathname === href || pathname.startsWith(`${href}/`)
}

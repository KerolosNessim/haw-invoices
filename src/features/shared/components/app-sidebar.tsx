import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import LogoutBtn from "@/features/auth/components/logout-btn"
import {
  INVOICES_NAV_LINKS,
  routeMatches,
} from "@/features/shared/config/invoices-nav.config"
import { cn } from "@/lib/utils"
import { useTranslation } from "react-i18next"
import { Link, useLocation } from "react-router-dom"

export function AppSidebar() {
  const { i18n } = useTranslation()
  const { t: s } = useTranslation("translation", { keyPrefix: "sidebar" })
  const dir = i18n.dir()
  const location = useLocation()

  const routeActive = (href: string) => routeMatches(href, location.pathname)

  const sidebarGlassSurface = cn(
    "group-data-[variant=floating]:rounded-[1.35rem]",
    "relative overflow-hidden rounded-[inherit] border-sidebar-border/40 bg-sidebar/[0.94] backdrop-blur-[22px] backdrop-saturate-150 ring-1 ring-white/72 supports-[backdrop-filter]:bg-sidebar/88",
    "shadow-[inset_0_1px_0_rgb(255_255_255/75%),0_14px_48px_-26px_rgb(28_52_38/42%),0_28px_80px_-40px_rgb(77_52%_34%/22%)]",
    "dark:border-white/14 dark:bg-sidebar/[0.48] dark:ring-white/12 dark:backdrop-saturate-125",
    "dark:shadow-[inset_0_1px_0_rgb(255_255_255/12%),0_22px_60px_-26px_rgb(0_0_0/55%)]",
    "before:pointer-events-none before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/45 before:via-transparent before:to-sidebar-primary/[0.11] dark:before:from-white/[0.045] dark:before:to-sidebar-primary/[0.15]",
    "after:pointer-events-none after:absolute after:inset-x-[12%] after:top-0 after:h-[1px] after:bg-linear-to-r after:from-transparent after:via-white/70 after:to-transparent dark:after:via-white/28",
    "transition-[background-color,border-color,box-shadow] duration-300",
  )

  const linkButtonClass = (active: boolean) =>
    cn(
      "h-[2.5625rem] rounded-[calc(0.75rem)] border border-transparent text-start text-[0.9rem] text-sidebar-foreground antialiased outline-none transition-all duration-200 ease-out focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
      dir === "rtl" && "flex-row-reverse text-right",
      active
        ? [
            "border-sidebar-primary/45 bg-sidebar-primary text-sidebar-primary-foreground",
            "shadow-[0_12px_32px_-16px_hsl(77_52%_26%/52%),inset_0_1px_0_rgb(255_255_255/22%)]",
            "hover:brightness-[1.03]",
            "data-active:bg-sidebar-primary data-active:text-sidebar-primary-foreground",
            "[&_svg]:text-sidebar-primary-foreground [&_svg]:opacity-100",
          ]
        : [
            "bg-transparent text-sidebar-foreground/95",
            "hover:border-sidebar-primary/22 hover:bg-gradient-to-br hover:from-sidebar-accent/85 hover:to-sidebar-accent/[0.58]",
            "hover:text-sidebar-accent-foreground hover:shadow-[0_8px_22px_-16px_hsl(77_52%_30%/38%)]",
            "dark:hover:border-white/[0.09] dark:hover:from-sidebar-accent/40 dark:hover:to-sidebar-accent/[0.26]",
            "active:translate-y-[0.5px] [&_svg]:text-sidebar-primary/88",
          ],
    )

  return (
    <Sidebar
      side={dir === "rtl" ? "right" : "left"}
      variant="floating"
      className="z-30"
      sidebarInnerClassName={sidebarGlassSurface}
    >
      <SidebarHeader className="relative z-10 shrink-0 border-none px-3.5 pb-2.5 pt-3">
        <div
          className={cn(
            "flex items-center gap-3 rounded-[calc(1.125rem)] border border-white/72 bg-linear-to-br from-white/92 via-white/58 to-sidebar-accent/[0.14] px-3 py-3 shadow-[0_14px_40px_-30px_rgb(28_52_38/72%),inset_0_1px_0_rgb(255_255_255/90%)] backdrop-blur-2xl dark:border-white/14 dark:from-sidebar-accent/45 dark:via-sidebar-accent/[0.2] dark:to-transparent dark:shadow-[inset_0_1px_0_rgb(255_255_255/10%),0_12px_40px_-34px_rgb(0_0_0/72%)]",
            dir === "rtl" && "flex-row-reverse text-right",
          )}
        >
          <img
            src="/logo.png"
            alt="logo"
            className="mx-auto h-12 w-full object-contain"
          />
        </div>
      </SidebarHeader>

      <SidebarContent className="relative z-10 min-h-0 flex-1 px-2.5">
        <SidebarGroup className="p-0">
          <SidebarGroupContent className="px-1 pb-2">
            <SidebarMenu className="gap-[0.5625rem] space-y-0">
              {INVOICES_NAV_LINKS.map((link) => {
                const LinkIcon = link.icon
                const active = routeActive(link.href)

                return (
                  <SidebarMenuItem key={link.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      size="lg"
                      className={cn(
                        "group/nav h-[2.75rem] rounded-[calc(0.8125rem)] text-[0.95rem]",
                        linkButtonClass(active),
                      )}
                    >
                      <Link
                        to={link.href}
                        className="flex w-full items-center gap-[0.7rem] font-semibold leading-snug [&_svg]:size-[1.125rem]"
                      >
                        <LinkIcon className="shrink-0" aria-hidden />
                        <span className="min-w-0 flex-1 truncate">
                          {s(link.titleKey)}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="relative z-10 mt-auto shrink-0 gap-0 border-transparent px-[1.0625rem] pb-6 pt-[0.625rem] before:pointer-events-none before:absolute before:inset-x-10 before:-top-[1px] before:h-[1px] before:bg-linear-to-r before:from-transparent before:via-sidebar-border/55 before:to-transparent dark:before:via-white/22">
        <SidebarMenu className="gap-3 pt-3">
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="p-0">
              <LogoutBtn />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

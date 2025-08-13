"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Users,
  Package,
  Bell,
  Mail,
  Map,
  ShoppingCart,
  Camera,
  Settings,
} from "lucide-react";
import { Button } from "./ui/button";

const menuItems = [
  {
    href: "/",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/route",
    label: "Start Call",
    icon: Map,
  },
  {
    href: "/orders",
    label: "Orders",
    icon: ShoppingCart,
  },
  {
    href: "/customers",
    label: "Customers",
    icon: Users,
  },
  {
    href: "/products",
    label: "Products",
    icon: Package,
  },
  {
    href: "/reminders",
    label: "Reminders",
    icon: Bell,
  },
  {
    href: "/photos",
    label: "Photos",
    icon: Camera,
  },
  {
    href: "/email-generator",
    label: "Email Generator",
    icon: Mail,
  },
];

const KameeldoringTreeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 512 512"
        {...props}
    >
        <path d="M416 320c0-53-43-96-96-96h-16v-32h16c26.5 0 48-21.5 48-48s-21.5-48-48-48h-16v-16c0-26.5-21.5-48-48-48s-48 21.5-48 48v16h-16c-26.5 0-48 21.5-48 48s21.5 48 48 48h16v32h-16c-53 0-96 43-96 96s43 96 96 96h32v32c0 17.7 14.3 32 32 32h64c17.7 0 32-14.3 32-32v-32h32c53 0 96-43 96-96z" />
    </svg>
)

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 p-2">
            <Button variant="ghost" size="icon" className="h-12 w-12">
              <KameeldoringTreeIcon className="h-8 w-8 text-primary" />
            </Button>
            <span className="text-xl font-semibold tracking-tight">BB Sales Pro</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href}>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    tooltip={item.label}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
                <Link href="/settings">
                    <SidebarMenuButton
                        isActive={pathname === "/settings"}
                        tooltip="Settings"
                    >
                        <Settings />
                        <span>Settings</span>
                    </SidebarMenuButton>
                </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 py-2">
            <SidebarTrigger className="sm:hidden" />
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}

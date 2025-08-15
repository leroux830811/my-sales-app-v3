
"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
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
  Map,
  ShoppingCart,
  Camera,
  Settings,
  MapPin,
  LogOut
} from "lucide-react";
import { Button } from "./ui/button";
import { useTheme } from "@/context/theme-context";
import { useAuth } from "@/context/auth-context";
import { Skeleton } from "./ui/skeleton";

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
    href: "https://www.google.com/maps",
    label: "Google Maps",
    icon: MapPin,
    external: true,
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
  const router = useRouter();
  const { theme, logo, setLogo } = useTheme();
  const { user, loading, logout } = useAuth();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleLogoClick = () => {
    fileInputRef.current?.click();
  };

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  }

  // If loading, show a skeleton UI
  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="p-4 space-y-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
            </div>
        </div>
    );
  }

  // If not logged in and not on the login page, redirect
  if (!user && pathname !== '/login') {
    if (typeof window !== 'undefined') {
        router.push('/login');
    }
    return null; // or a loading spinner
  }
  
  // If logged in and on the login page, redirect to dashboard
  if (user && pathname === '/login') {
     if (typeof window !== 'undefined') {
        router.push('/');
     }
     return null;
  }

  // If not logged in, show the children (which should be the login page)
  if (!user) {
    return <>{children}</>;
  }


  return (
    <SidebarProvider>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleLogoChange}
      />
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 p-2">
            <Button variant="ghost" size="icon" className="h-12 w-12" onClick={handleLogoClick}>
                {logo ? (
                    <Image src={logo} alt="App Logo" width={32} height={32} className="object-contain h-8 w-8" />
                ) : (
                    <KameeldoringTreeIcon className="h-8 w-8 text-primary" />
                )}
            </Button>
            <span className="text-xl font-semibold tracking-tight">BB Sales Pro</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href} target={item.external ? "_blank" : "_self"} rel={item.external ? "noopener noreferrer" : ""}>
                  <SidebarMenuButton
                    isActive={pathname === item.href && !item.external}
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
                 <SidebarMenuButton onClick={handleLogout} tooltip="Logout">
                    <LogOut />
                    <span>Logout</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
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

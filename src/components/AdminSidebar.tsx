"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  HardDrive,
  CalendarClock,
  LogOut,
  Layers3,
} from "lucide-react";

const menuItems = [
  {
    href: "/admin/dashboard",
    label: "대시보드",
    icon: LayoutDashboard,
  },
  {
    href: "/admin/equipments",
    label: "장비 관리",
    icon: HardDrive,
  },
  {
    href: "/admin/rentals",
    label: "대여 기록 관리",
    icon: CalendarClock,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader>
        <Link href="/" className="flex items-center gap-2">
            <Layers3 className="size-6 text-primary" />
            <h1 className="text-lg font-semibold font-headline">EquiTrack</h1>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={{ children: item.label }}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip={{children: "로그아웃"}}>
                    <Link href="/">
                        <LogOut/>
                        <span>로그아웃</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

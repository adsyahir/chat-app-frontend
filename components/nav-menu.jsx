import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

import { MoreHorizontal } from "lucide-react";

export default function NavMenu({ items }) {
  return (
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupContent className="px-1.5 md:px-0">
          <SidebarMenu>
            {items.map((item) =>
              // With sub-items: the trigger IS the button. Wrapping it in a
              // Link put a <button> inside an <a>, which is invalid nesting —
              // the browser restructures that markup before React hydrates,
              // so the ids Radix generated on the server never matched.
              item.items?.length ? (
                <SidebarMenuItem key={item.title}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <SidebarMenuButton
                        tooltip={{ children: item.title, hidden: false }}
                        className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                      >
                        <item.icon />
                        <MoreHorizontal className="ml-auto" />
                      </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      side="right"
                      align="start"
                      className="min-w-56 rounded-lg"
                    >
                      {item.items.map((subItem) => (
                        <DropdownMenuItem asChild key={subItem.title}>
                          <Link href={subItem.url}>{subItem.title}</Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </SidebarMenuItem>
              ) : (
                // Without sub-items there is no menu to open, so render a plain
                // link instead of an empty dropdown.
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={{ children: item.title, hidden: false }}
                  >
                    <Link href={item.url ? item.url : "#"}>
                      <item.icon />
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            )}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  );
}

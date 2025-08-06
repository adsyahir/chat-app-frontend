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
            {items.map((item) => (
              <DropdownMenu key={item.title}>
                <SidebarMenuItem>
                  <DropdownMenuTrigger asChild>
                    <Link href={item.url ? item.url : "#"}>
                      <SidebarMenuButton
                        tooltip={{
                          children: item.title,
                          hidden: false,
                        }}
                        className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                      >
                        <item.icon />
                        <MoreHorizontal className="ml-auto" />
                      </SidebarMenuButton>
                    </Link>
                  </DropdownMenuTrigger>
                  {item.items?.length ? (
                    <DropdownMenuContent
                      side={"right"}
                      align={"start"}
                      //   side={isMobile ? "bottom" : "right"}
                      //   align={isMobile ? "end" : "start"}
                      className="min-w-56 rounded-lg"
                    >
                      {item.items.map((item) => (
                        <DropdownMenuItem asChild key={item.title}>
                          <Link href={item.url}>{item.title}</Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  ) : null}
                </SidebarMenuItem>
              </DropdownMenu>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  );
}

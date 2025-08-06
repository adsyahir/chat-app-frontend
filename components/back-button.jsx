"use client";
import { SidebarGroupAction } from "@/components/ui/sidebar";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { usePathname } from "next/navigation";
export default function BackButton() {
    const pathname = usePathname();

  return (
    <>
      {pathname !== "/dashboard" && (
        <SidebarGroupAction title="Back">
          <Link href="/dashboard">
            <ArrowLeft />
            <span className="sr-only">Back</span>
          </Link>
        </SidebarGroupAction>
      )}
    </>
  );
}

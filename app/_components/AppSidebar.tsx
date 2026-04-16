import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "@/components/ui/sidebar";
import Image from "next/image";
import { ModeToggle } from "./ModeToggle";
import { Button } from "@/components/ui/button";

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <section className="flex items-center justify-between p-3">
          <Image width={60} height={60} src="/next.svg" alt="photo" />
          <ModeToggle />
        </section>
        <Button>New Chat + </Button>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <section className="p-3">
            <h1 className="text-lg font-extrabold">Chat</h1>
            <p className="text-sm text-gray-500">
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
              Accusamus, labore.
            </p>
          </section>
        </SidebarGroup>
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter>
        <section className="mb-4">
          <Button className="w-full">Sign In/Sign Up</Button>
        </section>
      </SidebarFooter>
    </Sidebar>
  );
}

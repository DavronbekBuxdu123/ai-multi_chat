"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Image from "next/image";
import { ModeToggle } from "./ModeToggle";
import { Button } from "@/components/ui/button";
import { SignInButton, useUser } from "@clerk/nextjs";
import {
  Bell,
  Bolt,
  ChevronDown,
  LogOut,
  Settings,
  User2,
  Zap,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ProgressBar from "./ProgressBar";

export function AppSidebar() {
  const { user } = useUser();
  return (
    <Sidebar>
      <SidebarHeader>
        <section className="flex items-center justify-between p-3">
          <Image width={60} height={60} src="/next.svg" alt="photo" />
          <ModeToggle />
        </section>
        {user ? (
          <Button className="cursor-pointer">New Chat + </Button>
        ) : (
          <SignInButton>
            <Button className="cursor-pointer">New Chat + </Button>
          </SignInButton>
        )}
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <section className="p-3">
            <h1 className="text-lg font-extrabold">Chat</h1>
            {!user && (
              <p className="text-sm text-gray-500">
                Lorem ipsum dolor sit amet consectetur adipisicing elit.
                Accusamus, labore.
              </p>
            )}
          </section>
        </SidebarGroup>
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border/50 p-2 dark:bg-[#0d1225]">
        <ProgressBar />
        <Button className="w-full">
          <Zap />
          Upgrade to Plan
        </Button>

        {!user ? (
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  >
                    <User2 className="size-4" />
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate text-xs">user@example.com</span>
                    </div>
                    <ChevronDown className="ml-auto size-4" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-[--radix-dropdown-menu-trigger-width] min-w-56"
                  side="top"
                  align="end"
                >
                  <DropdownMenuItem>
                    <Bell className="mr-2 size-4" /> Account
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 size-4" /> Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive cursor-pointer">
                    <LogOut className="mr-2 size-4" /> Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        ) : (
          <SignInButton mode="modal">
            <Button>Sign In / Sign Up</Button>
          </SignInButton>
        )}
      </SidebarFooter>
      ;
    </Sidebar>
  );
}

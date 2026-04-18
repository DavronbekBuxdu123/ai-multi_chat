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
import { useContext, useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/config/FireBaseConfig";
import moment from "moment";
import Link from "next/link";
import axios from "axios";
import { AiModelSelectedContext } from "@/context/AiModelSelectedContext";

export function AppSidebar() {
  const { user } = useUser();
  const [chatHistory, setChatHistory] = useState([]);
  const [FreeCount, setFreeCount] = useState(0);
  const { selectedModel, setSelectedModel, messages, setMessages } = useContext(
    AiModelSelectedContext
  );
  useEffect(() => {
    user && getChatHistory();
  }, [user]);
  useEffect(() => {
    user && TokenLimit();
  }, [messages]);
  const getChatHistory = async () => {
    const q = query(
      collection(db, "chatHistory"),
      where("userEmail", "==", user?.primaryEmailAddress?.emailAddress)
    );
    const querySnapshot = await getDocs(q);
    const historyData = [];
    querySnapshot.forEach((doc) => {
      historyData.push({ id: doc.id, ...doc.data() });
    });
    setChatHistory(historyData);
  };

  const GetLastUserMessageFromChat = (chat) => {
    if (!chat.messages) return { message: "No messages", lastMsgDate: "" };
    const allMessages = Object.values(chat.messages).flat();
    const userMessages = allMessages.filter((msg) => msg.role === "user");
    const lastUserMsg =
      userMessages.length > 0
        ? userMessages[userMessages.length - 1].content
        : "No user message";

    const lastUpdated = chat.lastUpdated?.seconds
      ? chat.lastUpdated.toDate()
      : chat.lastUpdated || Date.now();

    const formattedDate = moment(lastUpdated).fromNow();

    return {
      chatId: chat.chatId,
      message: lastUserMsg,
      lastMsgDate: formattedDate,
    };
  };

  const TokenLimit = async () => {
    try {
      const result = await axios.post("/api/user-remaining-msg");
      setFreeCount(result.data.remainingToken);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <Sidebar>
      <SidebarHeader>
        <section className="flex items-center justify-between p-3">
          <Image width={60} height={60} src="/next.svg" alt="photo" />
          <ModeToggle />
        </section>
        {user ? (
          <Link href={"/"}>
            <Button className="cursor-pointer w-full">New Chat + </Button>
          </Link>
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

            {chatHistory.map((chat, index) => (
              <Link
                href={"?chatId=" + chat.chatId}
                className="mt-2 "
                key={index}
              >
                <div className="hover:bg-gray-100 p-3 cursor-pointer">
                  {" "}
                  <h2 className="text-sm text-gray-500 ">
                    {GetLastUserMessageFromChat(chat).lastMsgDate}
                  </h2>
                  <h2 className="text-md line-clamp-1">
                    {GetLastUserMessageFromChat(chat).message}
                  </h2>
                </div>

                <hr />
              </Link>
            ))}
          </section>
        </SidebarGroup>
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border/50 p-2 dark:bg-[#0d1225]">
        <ProgressBar remainingToken={FreeCount} />
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

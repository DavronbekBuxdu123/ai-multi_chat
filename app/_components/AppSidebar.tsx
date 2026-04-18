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
import { Bell, ChevronDown, LogOut, Settings, User2, Zap } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ProgressBar from "./ProgressBar";
import { useContext, useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/config/FireBaseConfig";
import moment from "moment";
import Link from "next/link";
import axios from "axios";
import { AiModelSelectedContext } from "@/context/AiModelSelectedContext";
import PricingModal from "./PricingModal";

interface Message {
  role: string;
  content: string;
}

interface ChatData {
  id: string;
  chatId: string;
  userEmail: string;
  messages: Message[] | Record<string, Message[]>;
  lastUpdated?: Timestamp | any;
}

export function AppSidebar() {
  const { user } = useUser();

  const [chatHistory, setChatHistory] = useState<ChatData[]>([]);
  const [FreeCount, setFreeCount] = useState<number>(0);

  const context = useContext(AiModelSelectedContext);

  if (!context) return null;
  const { messages } = context;

  useEffect(() => {
    if (user) getChatHistory();
  }, [user]);

  useEffect(() => {
    if (user) TokenLimit();
  }, [messages, user]);

  const getChatHistory = async () => {
    if (!user?.primaryEmailAddress?.emailAddress) return;

    const q = query(
      collection(db, "chatHistory"),
      where("userEmail", "==", user.primaryEmailAddress.emailAddress)
    );

    const querySnapshot = await getDocs(q);
    const historyData: ChatData[] = [];
    querySnapshot.forEach((doc) => {
      historyData.push({ id: doc.id, ...doc.data() } as ChatData);
    });
    setChatHistory(historyData);
  };

  const GetLastUserMessageFromChat = (chat: ChatData) => {
    if (!chat.messages) return { message: "No messages", lastMsgDate: "" };

    const allMessages: Message[] = Array.isArray(chat.messages)
      ? chat.messages
      : Object.values(chat.messages).flat();

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
      setFreeCount(result.data.remainingToken ?? 0);
    } catch (error) {
      console.error("Token error:", error);
    }
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <section className="flex items-center justify-between p-3">
          <Image width={60} height={60} src="/next.svg" alt="logo" priority />
          <ModeToggle />
        </section>
        {user ? (
          <Link href={"/"}>
            <Button className="cursor-pointer w-full">New Chat + </Button>
          </Link>
        ) : (
          <SignInButton mode="modal">
            <Button className="cursor-pointer w-full">New Chat + </Button>
          </SignInButton>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <section className="p-3">
            <h1 className="text-lg font-extrabold">Chat History</h1>
            {!user && (
              <p className="text-sm text-gray-500 italic">
                Tizimga kiring va suhbatlarni ko'ring.
              </p>
            )}

            {chatHistory.map((chat) => {
              const lastMsgInfo = GetLastUserMessageFromChat(chat);
              return (
                <Link
                  href={"?chatId=" + chat.chatId}
                  className="block mt-2"
                  key={chat.id}
                >
                  <div className="hover:bg-sidebar-accent p-3 cursor-pointer rounded-lg transition-colors border-b">
                    <h2 className="text-[10px] text-gray-500">
                      {lastMsgInfo.lastMsgDate}
                    </h2>
                    <h2 className="text-sm font-medium line-clamp-1">
                      {lastMsgInfo.message}
                    </h2>
                  </div>
                </Link>
              );
            })}
          </section>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/50 p-4 dark:bg-[#0d1225] gap-3">
        <ProgressBar remainingToken={FreeCount} />

        <PricingModal>
          <Button className="w-full flex gap-2">
            <Zap className="size-4 fill-yellow-400" />
            Upgrade Plan
          </Button>
        </PricingModal>

        {user ? (
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton size="lg">
                    <User2 className="size-4" />
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate text-xs font-semibold">
                        {user.primaryEmailAddress?.emailAddress}
                      </span>
                    </div>
                    <ChevronDown className="ml-auto size-4" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" side="top" align="end">
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
            <Button variant="outline" className="w-full">
              Sign In / Sign Up
            </Button>
          </SignInButton>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}

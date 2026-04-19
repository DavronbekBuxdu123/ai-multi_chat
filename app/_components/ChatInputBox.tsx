"use client";
import { Button } from "@/components/ui/button";
import { db } from "@/config/FireBaseConfig";
import { AiModelSelectedContext } from "@/context/AiModelSelectedContext";
import { useUser } from "@clerk/nextjs";
import axios from "axios";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Mic, Paperclip, Send } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useContext, useEffect, useState, useCallback, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner"; // Sonner importi

function ChatInputBox() {
  const [userInput, setUserInput] = useState("");
  const [chatId, setChatId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const params = useSearchParams();
  const context = useContext(AiModelSelectedContext);
  const { user } = useUser();
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  if (!context) {
    throw new Error("AiModelSelectedContext must be used within a Provider");
  }
  const { selectedModel, messages, setMessages } = context;

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "auto";
      textAreaRef.current.style.height =
        textAreaRef.current.scrollHeight + "px";
    }
  }, [userInput]);

  const GetMessages = useCallback(
    async (id: string) => {
      if (!id) return;
      try {
        const docRef = doc(db, "chatHistory", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setMessages(docSnap.data().messages || {});
        }
      } catch (error) {
        console.error("Xabarlarni yuklashda xato:", error);
      }
    },
    [setMessages]
  );

  useEffect(() => {
    const idFromParams = params.get("chatId");
    if (idFromParams) {
      setChatId(idFromParams);
      GetMessages(idFromParams);
    } else {
      setMessages({});
      setChatId(uuidv4());
    }
  }, [params, GetMessages, setMessages]);

  const handleSend = async () => {
    if (!userInput.trim() || isLoading) return;

    try {
      setIsLoading(true);
      const result = await axios.post("/api/user-remaining-msg", { token: 1 });
      const remainingToken = result?.data?.remainingToken;

      if (remainingToken <= 0) {
        toast.error("Limit tugadi!", {
          description:
            "Sizning bepul xabarlaringiz tugadi. Iltimos, tarifni yangilang.",
          position: "top-center",
        });
        setIsLoading(false);
        return;
      }

      const currentInput = userInput;
      setUserInput("");

      setMessages((prev: any) => {
        const updated = { ...prev };
        Object.entries(selectedModel).forEach(
          ([modelKey, modelInfo]: [string, any]) => {
            if (modelInfo.enable) {
              updated[modelKey] = [
                ...(updated[modelKey] ?? []),
                { role: "user", content: currentInput },
              ];
            }
          }
        );
        return updated;
      });

      await Promise.all(
        Object.entries(selectedModel).map(
          async ([parentModel, modelInfo]: [string, any]) => {
            if (!modelInfo.enable || !modelInfo.modelId) return;

            setMessages((prev: any) => ({
              ...prev,
              [parentModel]: [
                ...(prev[parentModel] ?? []),
                { role: "assistant", content: "O'ylamoqda...", loading: true },
              ],
            }));

            try {
              const aiResult = await axios.post("/api/ai-multi_model", {
                model: modelInfo.modelId,
                msg: [{ role: "user", content: currentInput }],
                parentModel,
              });

              setMessages((prev: any) => {
                const updated = [...(prev[parentModel] ?? [])];
                const idx = updated.findIndex((m) => m.loading);
                if (idx !== -1) {
                  updated[idx] = {
                    role: "assistant",
                    content: aiResult.data.aiResponse,
                    loading: false,
                  };
                }
                return { ...prev, [parentModel]: updated };
              });
            } catch (e) {
              toast.error(`${parentModel} xatosi`, {
                description: "Javob olishda muammo bo'ldi.",
              });
            }
          }
        )
      );
    } catch (error) {
      toast.error("Tizim xatosi", {
        description: "Server bilan bog'lanishda xatolik.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const SaveMessages = useCallback(async () => {
    if (!chatId || Object.keys(messages).length === 0) return;
    try {
      await setDoc(
        doc(db, "chatHistory", chatId),
        {
          chatId,
          userEmail: user?.primaryEmailAddress?.emailAddress || "anonymous",
          messages,
          lastUpdated: new Date(),
        },
        { merge: true }
      );
    } catch (e) {
      console.error(e);
    }
  }, [chatId, messages, user]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (Object.keys(messages).length > 0) SaveMessages();
    }, 1000);
    return () => clearTimeout(timeout);
  }, [messages, SaveMessages]);

  return (
    <div
      className="fixed dark:bg-[#0d1225] bottom-0 right-0 z-50 p-3 md:p-6 transition-all duration-300
    w-full 
    md:w-[calc(100%-var(--sidebar-width,0px))] 
    peer-data-[state=collapsed]:md:w-[calc(100%-var(--sidebar-width-icon,0px))]  "
    >
      <div className="max-w-4xl mx-auto">
        <div className="relative flex flex-col w-full border rounded-2xl bg-card  transition-all border-border/50 dark:bg-[#0d1225]">
          <textarea
            ref={textAreaRef}
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="AI dan so'rang..."
            className="w-full p-4 bg-transparent border-none outline-none resize-none min-h-[50px] max-h-[160px] text-sm md:text-base"
            rows={1}
          />

          <div className="flex items-center justify-between px-3 py-2 border-t border-border/10">
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-xl"
              >
                <Paperclip className="h-5 w-5 text-muted-foreground" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-xl"
              >
                <Mic className="h-5 w-5 text-muted-foreground" />
              </Button>
            </div>

            <Button
              onClick={handleSend}
              disabled={!userInput.trim() || isLoading}
              className="h-9 px-4 rounded-xl gap-2 font-medium active:scale-95 transition-all"
            >
              <span className="hidden md:inline">Yuborish</span>
              <Send className={`h-4 w-4 ${isLoading ? "animate-pulse" : ""}`} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatInputBox;

"use client";
import { Button } from "@/components/ui/button";
import { db } from "@/config/FireBaseConfig";
import { AiModelSelectedContext } from "@/context/AiModelSelectedContext";
import { useUser } from "@clerk/nextjs";
import axios from "axios";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Mic, Paperclip, Send } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useContext, useEffect, useState, useCallback, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";

interface ModelInfo {
  enable: boolean;
  modelId: string;
}

function ChatInputBox() {
  const [userInput, setUserInput] = useState("");
  const [chatId, setChatId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const params = useSearchParams();
  const router = useRouter();
  const context = useContext(AiModelSelectedContext);
  const { user } = useUser();
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  if (!context) {
    throw new Error("AiModelSelectedContext must be used within a Provider");
  }
  const { selectedModel, messages, setMessages } = context;

  // Textarea balandligini avtomatik sozlash
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
            "Sizning bepul xabarlaringiz tugadi. Pro rejimga o'ting.",
          action: {
            label: "Upgrade",
            onClick: () => router.push("/dashboard/upgrade"),
          },
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
            const info = modelInfo as ModelInfo;
            if (!info.enable || !info.modelId) return;

            setMessages((prev: any) => ({
              ...prev,
              [parentModel]: [
                ...(prev[parentModel] ?? []),
                { role: "assistant", content: "O'ylamoqda...", loading: true },
              ],
            }));

            try {
              const aiResult = await axios.post("/api/ai-multi_model", {
                model: info.modelId,
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
      console.error("Firestore-ga saqlashda xato:", e);
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
      className="fixed bottom-0 right-0 z-50 p-3 md:p-6 transition-all duration-300
      w-full 
      md:w-[calc(100%-var(--sidebar-width,16rem))] 
      peer-data-[state=collapsed]:md:w-[calc(100%-var(--sidebar-width-icon,3rem))] bg-gradient-to-t from-[#0d1225] via-[#0d1225]/90 to-transparent"
    >
      <div className="max-w-4xl mx-auto">
        <div className="relative flex flex-col w-full border rounded-2xl bg-card/80 backdrop-blur-md transition-all border-border/50 dark:bg-[#161b2e]">
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
            className="w-full p-4 bg-transparent border-none outline-none resize-none min-h-[50px] max-h-[160px] text-sm md:text-base scrollbar-hide"
            rows={1}
          />

          <div className="flex items-center justify-between px-3 py-2 border-t border-border/10">
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-xl hover:bg-white/5"
              >
                <Paperclip className="h-5 w-5 text-muted-foreground" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-xl hover:bg-white/5"
              >
                <Mic className="h-5 w-5 text-muted-foreground" />
              </Button>
            </div>

            <Button
              onClick={handleSend}
              disabled={!userInput.trim() || isLoading}
              className="h-9 px-4 rounded-xl gap-2 font-medium active:scale-95 transition-all bg-blue-600 hover:bg-blue-700 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]"
            >
              {isLoading ? (
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span className="hidden md:inline">Yuborish</span>
                  <Send className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
        <p className="text-[10px] text-center mt-2 text-muted-foreground/50">
          DavaAi xatoga yo'l qo'yishi mumkin. Muhim ma'lumotlarni tekshirib
          ko'ring.
        </p>
      </div>
    </div>
  );
}

export default ChatInputBox;

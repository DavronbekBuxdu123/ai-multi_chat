"use client";
import { Button } from "@/components/ui/button";
import { db } from "@/config/FireBaseConfig";
import { AiModelSelectedContext } from "@/context/AiModelSelectedContext";
import { useUser } from "@clerk/nextjs";
import axios from "axios";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Mic, Paperclip, Send } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useContext, useEffect, useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";

function ChatInputBox() {
  const [userInput, setUserInput] = useState("");
  const [chatId, setChatId] = useState("");
  const params = useSearchParams();
  const context = useContext(AiModelSelectedContext);
  const { user } = useUser();

  if (!context) {
    throw new Error("AiModelSelectedContext must be used within a Provider");
  }
  const { selectedModel, messages, setMessages } = context;

  const GetMessages = useCallback(
    async (chatId_: string) => {
      if (!chatId_) return;
      try {
        const docRef = doc(db, "chatHistory", chatId_);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const docData = docSnap.data();
          setMessages(docData.messages || {});
        }
      } catch (error) {
        console.error("GetMessages error:", error);
      }
    },
    [setMessages]
  );

  useEffect(() => {
    const chatId_ = params.get("chatId");
    if (chatId_) {
      setChatId(chatId_);
      GetMessages(chatId_);
    } else {
      setMessages({});
      setChatId(uuidv4());
    }
  }, [params, GetMessages, setMessages]);

  const handleSend = async () => {
    if (!userInput.trim()) return;

    try {
      const result = await axios.post("/api/user-remaining-msg", { token: 1 });
      const remainingToken = result?.data?.remainingToken;

      if (remainingToken <= 0) {
        alert("Limit tugadi. Iltimos, rejangizni yangilang.");
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

      Object.entries(selectedModel).forEach(
        async ([parentModel, modelInfo]: [string, any]) => {
          if (!modelInfo.enable || !modelInfo.modelId) return;

          setMessages((prev: any) => ({
            ...prev,
            [parentModel]: [
              ...(prev[parentModel] ?? []),
              {
                role: "assistant",
                content: "Thinking...",
                model: parentModel,
                loading: true,
              },
            ],
          }));

          try {
            const aiResult = await axios.post("/api/ai-multi_model", {
              model: modelInfo.modelId,
              msg: [{ role: "user", content: currentInput }],
              parentModel,
            });

            const { aiResponse } = aiResult.data;

            setMessages((prev: any) => {
              const updated = [...(prev[parentModel] ?? [])];
              const loadingIndex = updated.findIndex((m) => m.loading);
              if (loadingIndex !== -1) {
                updated[loadingIndex] = {
                  role: "assistant",
                  content: aiResponse,
                  model: parentModel,
                  loading: false,
                };
              }
              return { ...prev, [parentModel]: updated };
            });
          } catch (err) {
            console.error(`${parentModel} error:`, err);
            setMessages((prev: any) => ({
              ...prev,
              [parentModel]: [
                ...(prev[parentModel] ?? []).filter((m: any) => !m.loading),
                { role: "assistant", content: "⚠️ Error fetching response." },
              ],
            }));
          }
        }
      );
    } catch (error) {
      console.error("Send error:", error);
    }
  };

  const SaveMessages = useCallback(async () => {
    if (!chatId || Object.keys(messages).length === 0) return;
    try {
      const docRef = doc(db, "chatHistory", chatId);
      await setDoc(
        docRef,
        {
          chatId: chatId,
          userEmail: user?.primaryEmailAddress?.emailAddress || "anonymous",
          messages: messages,
          lastUpdated: new Date(),
        },
        { merge: true }
      );
    } catch (error) {
      console.error("SaveMessages error:", error);
    }
  }, [chatId, messages, user]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (Object.keys(messages).length > 0) {
        SaveMessages();
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [messages, SaveMessages]);

  return (
    <div className="relative w-full">
      <div className="flex justify-center fixed bottom-0 left-0 mb-4 px-4 pb-4 w-full bg-transparent">
        <div className="w-full shadow-lg rounded-xl border bg-background max-w-2xl p-4 flex flex-col gap-3">
          <input
            value={userInput}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            onChange={(e) => setUserInput(e.target.value)}
            type="text"
            placeholder="Ask me anything..."
            className="border-none outline-none bg-transparent w-full text-sm"
          />
          <div className="flex items-center justify-between">
            <Button
              className="cursor-pointer h-8 w-8"
              variant="ghost"
              size="icon"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <div className="flex gap-2">
              <Button
                className="cursor-pointer h-8 w-8"
                variant="ghost"
                size="icon"
              >
                <Mic className="h-4 w-4" />
              </Button>
              <Button
                onClick={handleSend}
                className="cursor-pointer h-8 w-8"
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatInputBox;

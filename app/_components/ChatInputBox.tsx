"use client";
import { Button } from "@/components/ui/button";
import { db } from "@/config/FireBaseConfig";
import { AiModelSelectedContext } from "@/context/AiModelSelectedContext";
import { useUser } from "@clerk/nextjs";
import axios from "axios";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Mic, Paperclip, Send } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
function ChatInputBox() {
  const [userInput, setUserInput] = useState("");
  const [chatId, setChatId] = useState("");
  const params = useSearchParams();
  const { selectedModel, setSelectedModel, messages, setMessages } = useContext(
    AiModelSelectedContext
  );
  const { user } = useUser();
  useEffect(() => {
    const chatId_ = params.get("chatId");
    if (chatId_) {
      setChatId(chatId_);
      GetMessages(chatId_);
    } else {
      setMessages([]);
      setChatId(uuidv4());
    }
  }, [params]);

  const handleSend = async () => {
    if (!userInput.trim()) return;
    const result = await axios.post("/api/user-remaining-msg", {
      token: 1,
    });
    const remainingToken = result?.data?.remainingToken;
    if (remainingToken <= 0) {
      console.log("Limit tugadi");
      return;
    }
    setMessages((prev) => {
      const updated = { ...prev };
      Object.entries(selectedModel).forEach(([modelKey, modelInfo]) => {
        if (modelInfo.enable) {
          updated[modelKey] = [
            ...(updated[modelKey] ?? []),
            { role: "user", content: userInput },
          ];
        }
      });
      return updated;
    });

    const currentInput = userInput;
    setUserInput("");

    Object.entries(selectedModel).forEach(async ([parentModel, modelInfo]) => {
      if (!modelInfo.enable || !modelInfo.modelId) {
        console.log(`${parentModel} o'chirilgan yoki ID tanlanmagan.`);
        return;
      }

      setMessages((prev) => ({
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
        const result = await axios.post("/api/ai-multi_model", {
          model: modelInfo.modelId,

          msg: [{ role: "user", content: currentInput }],
          parentModel,
        });

        const { aiResponse } = result.data;

        setMessages((prev) => {
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

        setMessages((prev) => {
          const updated = (prev[parentModel] ?? []).filter((m) => !m.loading);
          return {
            ...prev,
            [parentModel]: [
              ...updated,
              { role: "assistant", content: "⚠️ Error fetching response." },
            ],
          };
        });
      }
    });
  };

  useEffect(() => {
    if (messages) {
      SaveMessages();
    }
  }, [messages]);

  const SaveMessages = async () => {
    const docRef = doc(db, "chatHistory", chatId);

    await setDoc(docRef, {
      chatId: chatId,
      userEmail: user?.primaryEmailAddress?.emailAddress,
      messages: messages,
      lastUpdated: new Date(),
    });
  };
  const GetMessages = async (chatId) => {
    if (!chatId) return;
    const docRef = doc(db, "chatHistory", chatId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const docData = docSnap.data();
      setMessages(docData.messages);
    }
  };

  return (
    <div className="relative min-h-screen w-full">
      <div className="flex justify-center fixed bottom-0 left-0  mb-4 px-4 pb-4 w-full">
        <div className="w-full shadow-md rounded-xl border max-w-2xl p-3">
          <input
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            type="text"
            placeholder="Ask me  anything..."
            className="border-none outline-none"
          />
          <div className="mt-5 flex items-center justify-between">
            <Button className="cursor-pointer" variant={"ghost"} size={"icon"}>
              <Paperclip className="h-5 w-5 " />
            </Button>

            <div className="flex gap-5">
              <Button
                className="cursor-pointer"
                variant={"ghost"}
                size={"icon"}
              >
                <Mic className="h-5 w-5 " />
              </Button>
              <Button
                onClick={handleSend}
                className="cursor-pointer"
                size={"icon"}
              >
                <Send className="h-5 w-5 " />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatInputBox;

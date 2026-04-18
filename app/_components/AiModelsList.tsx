"use client";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useContext, useState } from "react";
import { AiModels } from "@/lists/AiModels";
import { Loader, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AiModelSelectedContext } from "@/context/AiModelSelectedContext";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/config/FireBaseConfig";
import { useUser } from "@clerk/nextjs";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface SubModel {
  name: string;
  id: string;
  premium: boolean;
}

interface AiModel {
  model: string;
  icon: string;
  enable: boolean;
  premium: boolean;
  subModel: SubModel[];
}

function AiModelsList() {
  const [aiModelsList, setAiModelList] = useState<AiModel[]>(AiModels);
  const { user } = useUser();
  const context = useContext(AiModelSelectedContext);

  if (!context) {
    return <div className="p-5 text-center">Loading Context...</div>;
  }

  const { selectedModel, setSelectedModel, messages } = context;

  const onToggleChange = async (targetmodel: AiModel) => {
    const newValue = !targetmodel.enable;

    setAiModelList((prev) =>
      prev.map((prevModel) =>
        prevModel.model === targetmodel.model
          ? { ...prevModel, enable: newValue }
          : prevModel
      )
    );

    setSelectedModel((prev: any) => ({
      ...prev,
      [targetmodel.model]: {
        ...(prev?.[targetmodel.model] ?? {}),
        enable: newValue,
      },
    }));
  };

  const onSelectedValue = async (parentModal: string, value: string) => {
    const newSelection = {
      ...selectedModel,
      [parentModal]: {
        ...selectedModel[parentModal],
        modelId: value,
      },
    };

    setSelectedModel(newSelection);

    const email = user?.primaryEmailAddress?.emailAddress;
    if (email) {
      try {
        const docRef = doc(db, "users", email);
        await updateDoc(docRef, { selectedModelRef: newSelection });
      } catch (error) {
        console.error("Update error:", error);
      }
    }
  };

  return (
    <div className="flex flex-1 h-[70vh] border-b p-3 overflow-x-auto bg-background">
      {aiModelsList.map((model, index) => {
        const modelMessages = messages[model.model] || [];

        return (
          <div
            key={index}
            className={`flex flex-col border-r h-full overflow-hidden transition-all duration-500 ease-in-out ${
              !model.enable ? "min-w-[100px] bg-muted/30" : "min-w-[400px]"
            } `}
          >
            <div className="flex items-center justify-between gap-4 border-b w-full p-3 bg-card">
              <div className="flex items-center gap-2">
                <Image
                  className="rounded-lg object-contain"
                  src={model.icon}
                  alt={model.model}
                  width={30}
                  height={30}
                />
                {!model.enable && (
                  <span className="text-xs font-medium truncate">
                    {model.model}
                  </span>
                )}
              </div>

              {model.enable && !model.premium && (
                <Select
                  onValueChange={(value) => onSelectedValue(model.model, value)}
                  value={selectedModel[model.model]?.modelId}
                >
                  <SelectTrigger className="w-[180px] h-9 text-xs">
                    <SelectValue placeholder="Model tanlang" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Free</SelectLabel>
                      {model.subModel.map(
                        (sub, i) =>
                          !sub.premium && (
                            <SelectItem key={i} value={sub.id}>
                              {sub.name}
                            </SelectItem>
                          )
                      )}
                    </SelectGroup>
                    <SelectGroup>
                      <SelectLabel>Premium</SelectLabel>
                      {model.subModel.map(
                        (sub, i) =>
                          sub.premium && (
                            <SelectItem key={i} value={sub.id} disabled>
                              <div className="flex items-center gap-2">
                                {sub.name} <Lock className="h-3 w-3" />
                              </div>
                            </SelectItem>
                          )
                      )}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}

              <Switch
                onCheckedChange={() => onToggleChange(model)}
                checked={model.enable}
              />
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              {model.premium ? (
                <div className="flex flex-col items-center justify-center h-full gap-4">
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-full">
                    <Lock className="h-8 w-8 text-yellow-600" />
                  </div>
                  <Button size="sm" variant="outline">
                    Pro rejaga o'tish
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {model.enable ? (
                    modelMessages.map((msg: any, i: number) => (
                      <div
                        key={i}
                        className={`p-3 rounded-2xl shadow-sm max-w-[90%] text-sm ${
                          msg.role === "user"
                            ? "bg-primary text-primary-foreground ml-auto rounded-tr-none"
                            : "bg-muted text-foreground mr-auto rounded-tl-none"
                        }`}
                      >
                        {msg.loading ? (
                          <div className="flex items-center gap-2 text-muted-foreground animate-pulse">
                            <Loader className="animate-spin h-3 w-3" />
                            <span>O'ylamoqda...</span>
                          </div>
                        ) : (
                          <div className="prose prose-sm dark:prose-invert max-w-full overflow-hidden break-words">
                            <Markdown remarkPlugins={[remarkGfm]}>
                              {msg.content}
                            </Markdown>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground text-xs italic">
                      Model o'chirilgan
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default AiModelsList;

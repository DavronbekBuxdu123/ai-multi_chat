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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const [activeTab, setActiveTab] = useState(AiModels[0].model);

  if (!context) return <div className="p-5 text-center">Loading...</div>;

  const { selectedModel, setSelectedModel, messages } = context;

  const onToggleChange = async (targetmodel: AiModel) => {
    const newValue = !targetmodel.enable;
    setAiModelList((prev) =>
      prev.map((m: AiModel) =>
        m.model === targetmodel.model ? { ...m, enable: newValue } : m
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
      [parentModal]: { ...selectedModel[parentModal], modelId: value },
    };
    setSelectedModel(newSelection);
    const email = user?.primaryEmailAddress?.emailAddress;
    if (email) {
      try {
        await updateDoc(doc(db, "users", email), {
          selectedModelRef: newSelection,
        });
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <div className="flex flex-col flex-1 h-[75vh] border-b bg-background  dark:bg-[#0d1225]">
      <div className="md:hidden w-full p-2 border-b bg-card overflow-x-auto">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full dark:bg-[#0d1225]"
        >
          <TabsList className="flex w-max gap-2 bg-transparent dark:bg-[#0d1225]">
            {aiModelsList.map((model) => (
              <TabsTrigger
                key={model.model}
                value={model.model}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-4 py-1 text-xs border"
              >
                {model.model}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="flex flex-1 overflow-x-auto overflow-y-hidden dark:bg-[#0d1225]">
        {aiModelsList.map((model, index) => {
          const modelMessages = messages[model.model] || [];
          const isVisibleOnMobile = activeTab === model.model;

          return (
            <div
              key={index}
              className={`flex-col border-r h-full overflow-hidden transition-all duration-300 ease-in-out dark:bg-[#0d1225]
                ${
                  !model.enable
                    ? "md:min-w-[100px] hidden md:flex"
                    : "md:min-w-[400px] flex"
                } 
                ${
                  isVisibleOnMobile
                    ? "flex w-full min-w-full"
                    : "hidden md:flex"
                } 
              `}
            >
              <div className="flex items-center justify-between gap-4 border-b w-full p-3 bg-card sticky top-0  dark:bg-[#0d1225]">
                <div className="flex items-center gap-2">
                  <Image
                    className="rounded-lg"
                    src={model.icon}
                    alt={model.model}
                    width={25}
                    height={25}
                  />
                  <span className="text-sm font-bold truncate md:block">
                    {model.model}
                  </span>
                </div>

                {model.enable && !model.premium && (
                  <Select
                    onValueChange={(v) => onSelectedValue(model.model, v)}
                    value={selectedModel[model.model]?.modelId}
                  >
                    <SelectTrigger className="w-[140px] md:w-[180px] h-8 text-[10px] md:text-xs">
                      <SelectValue placeholder="Model" />
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
                        <SelectLabel>Premium</SelectLabel>
                        {model.subModel.map(
                          (sub, i) =>
                            sub.premium && (
                              <SelectItem key={i} value={sub.id} disabled>
                                <div className="flex items-center gap-1">
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

              <div className="flex-1 overflow-y-auto p-3 space-y-4 pb-24 custom-scrollbar bg-slate-50/30 dark:bg-transparent">
                {model.premium ? (
                  <div className="flex flex-col items-center justify-center h-full gap-4 opacity-60 scale-90">
                    <div className="p-4 bg-yellow-100 dark:bg-yellow-900/20 rounded-full">
                      <Lock className="text-yellow-600" />
                    </div>
                    <Button size="sm" variant="outline" className="text-xs">
                      Pro reja
                    </Button>
                  </div>
                ) : (
                  <>
                    {!model.enable ? (
                      <div className="flex items-center justify-center h-full text-muted-foreground text-[10px] italic">
                        O'chirilgan
                      </div>
                    ) : (
                      modelMessages.map((msg: any, i: number) => (
                        <div
                          key={i}
                          className={`p-3 rounded-2xl shadow-sm max-w-[85%] text-xs md:text-sm ${
                            msg.role === "user"
                              ? "bg-primary text-primary-foreground ml-auto rounded-tr-none"
                              : "bg-muted text-foreground mr-auto rounded-tl-none"
                          }`}
                        >
                          {msg.loading ? (
                            <div className="flex items-center gap-2 animate-pulse">
                              <Loader className="animate-spin h-3 w-3" />{" "}
                              <span>...</span>
                            </div>
                          ) : (
                            <div className="prose prose-sm dark:prose-invert max-w-full overflow-hidden break-words leading-relaxed">
                              <Markdown remarkPlugins={[remarkGfm]}>
                                {msg.content}
                              </Markdown>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default AiModelsList;

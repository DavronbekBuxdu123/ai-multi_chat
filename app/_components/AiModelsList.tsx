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

function AiModelsList() {
  const [aiModelsList, setAiModelList] = useState(AiModels);
  const { user } = useUser();
  const { selectedModel, setSelectedModel, messages, setMessages } = useContext(
    AiModelSelectedContext
  );
  const onToggleChange = async (targetmodel) => {
    const newValue = !targetmodel.enable;

    setAiModelList((prev) =>
      prev.map((prevModel) =>
        prevModel.model === targetmodel.model
          ? { ...prevModel, enable: newValue }
          : prevModel
      )
    );

    setSelectedModel((prev) => ({
      ...prev,
      [targetmodel.model]: {
        ...(prev?.[targetmodel.model] ?? {}),
        enable: newValue,
      },
    }));
  };
  const onSelectedValue = async (parentModal, value) => {
    const newSelection = {
      ...selectedModel,
      [parentModal]: { modelId: value },
    };
    setSelectedModel(newSelection);
    const docRef = doc(db, "users", user?.primaryEmailAddress?.emailAddress);
    await updateDoc(docRef, { selectedModelRef: newSelection });
  };

  return (
    <div className="flex flex-1  h-[70vh]  border-b p-3">
      {aiModelsList.map((model, index) => (
        <div
          key={index}
          className={`flex flex-col border-r h-full overflow-auto transition-all duration-500 ease-in-out  ${
            !model.enable ? "min-w-[100px]" : "min-w-[400px]"
          } `}
        >
          <div className="w-full  items-center  gap-3">
            <div className="flex items-center justify-between gap-4 border-b w-full p-3">
              <Image
                className="rounded-lg w-[30px] h-[30px]"
                src={model.icon}
                alt={model.model}
                width={30}
                height={30}
              />
              {model.enable && !model.premium && (
                <Select
                  onValueChange={(value) => onSelectedValue(model.model, value)}
                  defaultValue={selectedModel[model.model]?.modelId}
                >
                  <SelectTrigger className="w-[200px] px-3 h-10 ">
                    <SelectValue
                      placeholder={selectedModel[model.model]?.modelId}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Free</SelectLabel>
                      {model.subModel.map(
                        (subModel, index) =>
                          !subModel.premium && (
                            <SelectItem key={index} value={subModel.id}>
                              {subModel.name}
                            </SelectItem>
                          )
                      )}
                    </SelectGroup>
                    <SelectGroup>
                      <SelectLabel>Premium</SelectLabel>
                      {model.subModel.map(
                        (subModel, index) =>
                          subModel.premium && (
                            <SelectItem
                              key={index}
                              disabled={subModel.premium}
                              value={subModel.id}
                            >
                              {subModel.name}
                              <Lock />
                            </SelectItem>
                          )
                      )}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}

              {model.premium ? (
                <Switch
                  onCheckedChange={() => onToggleChange(model)}
                  checked={!model.enable}
                />
              ) : (
                <Switch
                  onCheckedChange={() => onToggleChange(model)}
                  checked={model.enable}
                />
              )}
            </div>
            <div className="flex flex-col items-center justify-center flex-1 ">
              {model.premium ? (
                <Button size={"lg"} className="mt-50">
                  <Lock /> Pro
                </Button>
              ) : (
                <div>
                  {model.enable && (
                    <div className="flex-1 p-4 space-y-4 w-full max-w-[400px] overflow-y-auto overflow-x-hidden">
                      {messages[model.model]?.map((msg, i) => (
                        <div
                          key={i}
                          className={`p-3 rounded-lg shadow-sm break-words overflow-hidden ${
                            msg.role === "user"
                              ? "bg-blue-100 text-blue-900 ml-auto max-w-[90%]"
                              : "bg-gray-100 text-black mr-auto max-w-[90%]"
                          }`}
                        >
                          {msg.role === "assistant" && (
                            <div className="flex items-center gap-2 mb-1 border-b pb-1">
                              <span className="text-[10px] uppercase font-bold text-gray-400">
                                {msg.model}
                              </span>
                            </div>
                          )}

                          {msg.loading ? (
                            <div className="flex items-center gap-2 italic text-gray-400">
                              <Loader className="animate-spin h-4 w-4" />
                              <span>Thinking...</span>
                            </div>
                          ) : (
                            <div className="prose prose-sm max-w-full overflow-x-auto custom-markdown">
                              {msg?.content && (
                                <Markdown remarkPlugins={[remarkGfm]}>
                                  {msg?.content}
                                </Markdown>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default AiModelsList;

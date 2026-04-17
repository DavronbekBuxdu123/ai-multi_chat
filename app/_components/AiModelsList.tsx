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
import { useState } from "react";
import { AiModels } from "@/lists/AiModels";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

function AiModelsList() {
  const [aiModelsList, setAiModelList] = useState(AiModels);
  const onToggleChange = async (targetmodel) => {
    setAiModelList((prev) =>
      prev.map((prevModel) =>
        prevModel.model === targetmodel.model
          ? { ...prevModel, enable: !prevModel.enable }
          : prevModel
      )
    );
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
          <div key={index} className="w-full  items-center  gap-3">
            <div className="flex items-center justify-between gap-4 border-b w-full p-3">
              <Image
                className="rounded-lg w-[30px] h-[30px]"
                src={model.icon}
                alt={model.model}
                width={30}
                height={30}
              />
              {model.enable && !model.premium && (
                <Select>
                  <SelectTrigger className="w-[200px] px-3 h-10 ">
                    <SelectValue placeholder={model.subModel[0].name} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Free</SelectLabel>
                      {model.subModel.map(
                        (subModel, index) =>
                          !subModel.premium && (
                            <SelectItem key={index} value={subModel.name}>
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
                              disabled={subModel.premium}
                              key={index}
                              value={subModel.name}
                            >
                              {subModel.name} <Lock />
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
              {model.premium && (
                <Button size={"lg"} className="mt-50">
                  <Lock /> Pro
                </Button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default AiModelsList;

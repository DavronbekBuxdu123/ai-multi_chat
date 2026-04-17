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
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AiModelSelectedContext } from "@/context/AiModelSelectedContext";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/config/FireBaseConfig";
import { useUser } from "@clerk/nextjs";

function AiModelsList() {
  const [aiModelsList, setAiModelList] = useState(AiModels);
  const { user } = useUser();
  const { selectedModel, setSelectedModel } = useContext(
    AiModelSelectedContext
  );
  const onToggleChange = async (targetmodel) => {
    setAiModelList((prev) =>
      prev.map((prevModel) =>
        prevModel.model === targetmodel.model
          ? { ...prevModel, enable: !prevModel.enable }
          : prevModel
      )
    );
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

  console.log(selectedModel);
  return (
    <div className="flex flex-1  h-[70vh]  border-b p-3">
      {aiModelsList.map((model, index) => (
        <div
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
                        (subModel) =>
                          !subModel.premium && (
                            <SelectItem value={subModel.name}>
                              {subModel.name}
                            </SelectItem>
                          )
                      )}
                    </SelectGroup>
                    <SelectGroup>
                      <SelectLabel>Premium</SelectLabel>
                      {model.subModel.map(
                        (subModel) =>
                          subModel.premium && (
                            <SelectItem
                              disabled={subModel.premium}
                              value={subModel.name}
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

"use client";
import { DefaultModel } from "@/lists/AiModelsList";
import { createContext, ReactNode, useState } from "react";

export const AiModelSelectedContext = createContext<any>(null);

export const AiModelProvider = ({ children }: { children: ReactNode }) => {
  const [selectedModel, setSelectedModel] = useState(DefaultModel);

  return (
    <AiModelSelectedContext.Provider
      value={{ selectedModel, setSelectedModel }}
    >
      {children}
    </AiModelSelectedContext.Provider>
  );
};

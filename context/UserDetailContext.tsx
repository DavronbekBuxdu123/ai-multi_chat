"use client";
import { DefaultModel } from "@/lists/AiModelsList";
import { createContext, ReactNode, useState } from "react";

export const UserDetailContext = createContext<any>(null);

export const UserDetailProvider = ({ children }: { children: ReactNode }) => {
  const [userDetail, setUserDetail] = useState(DefaultModel);

  return (
    <UserDetailContext.Provider value={{ userDetail, setUserDetail }}>
      {children}
    </UserDetailContext.Provider>
  );
};

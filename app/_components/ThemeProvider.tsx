"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useUser } from "@clerk/nextjs";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/config/FireBaseConfig";
import { AiModelSelectedContext } from "@/context/AiModelSelectedContext";
import { UserDetailContext } from "@/context/UserDetailContext";
import { DefaultModel } from "@/lists/AiModelsList";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  const { user } = useUser();
  const { selectedModel, setSelectedModel } = React.useContext(
    AiModelSelectedContext
  );
  const { userDetail, setUserDetail } = React.useContext(UserDetailContext);
  React.useEffect(() => {
    if (user) {
      CreateNewUser();
    }
  }, [user]);

  React.useEffect(() => {
    if (user && selectedModel) {
      updateModels();
    }
  }, [selectedModel]);

  const updateModels = async () => {
    const email = user?.primaryEmailAddress?.emailAddress;
    if (!email) return;

    try {
      const docRef = doc(db, "users", email);
      await updateDoc(docRef, { selectedModelRef: selectedModel });
    } catch (e) {
      console.error("Modelni yangilashda xatolik:", e);
    }
  };

  const CreateNewUser = async () => {
    const email = user?.primaryEmailAddress?.emailAddress;
    if (!email) return;

    try {
      const userRef = doc(db, "users", email);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userInfo = userSnap.data();
        setSelectedModel(userInfo?.selectedModelRef ?? DefaultModel);
        setUserDetail(userInfo);
      } else {
        const userData = {
          name: user?.fullName || "No Name",
          email: email,
          createdAt: new Date(),
          remanaingMsg: 5,
          plan: "Free",
          credits: 1000,
        };
        await setDoc(userRef, userData);
        setUserDetail(userData);
      }
    } catch (e) {
      console.error("User yaratishda xatolik:", e);
    }
  };

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

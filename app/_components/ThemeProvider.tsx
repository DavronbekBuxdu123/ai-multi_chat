"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useUser } from "@clerk/nextjs";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/config/FireBaseConfig";
import { AiModelSelectedContext } from "@/context/AiModelSelectedContext";
import { UserDetailContext } from "@/context/UserDetailContext";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  const { user } = useUser();
  React.useEffect(() => {
    if (user) {
      CreateNewUser();
    }
  }, [user]);

  const { selectedModel, setSelectedModel } = React.useContext(
    AiModelSelectedContext
  );
  const { userDetail, setUserDetail } = React.useContext(UserDetailContext);
  const CreateNewUser = async () => {
    const email = user?.primaryEmailAddress?.emailAddress;
    if (!email) {
      return;
    }
    const userRef = doc(db, "users", email);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      console.log("Mavjud User");
      const userInfo = userSnap.data();
      setSelectedModel(userInfo?.selectedModelRef);
      setUserDetail(userInfo);
      return;
    } else {
      const userData = {
        name: user?.fullName,
        email: user?.primaryEmailAddress?.emailAddress,
        createdAt: new Date(),
        remanaingMsg: 5,
        plan: "Free",
        credits: 1000,
      };
      await setDoc(userRef, userData);
      setUserDetail(userData);
      console.log("User yaratildi!");
    }
  };

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

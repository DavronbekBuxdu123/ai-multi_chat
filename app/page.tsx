import { Suspense } from "react";
import AiModelsList from "./_components/AiModelsList";
import ChatInputBox from "./_components/ChatInputBox";

export default function Home() {
  return (
    <div className="">
      <AiModelsList />
      <Suspense
        fallback={
          <div className="p-4 text-gray-500">Input tayyorlanmoqda...</div>
        }
      >
        <ChatInputBox />
      </Suspense>
    </div>
  );
}

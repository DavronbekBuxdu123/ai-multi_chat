import AiModelsList from "./_components/AiModelsList";
import ChatInputBox from "./_components/ChatInputBox";

export default function Home() {
  return (
    <div className="scrollbar-hide">
      <AiModelsList />
      <ChatInputBox />
    </div>
  );
}

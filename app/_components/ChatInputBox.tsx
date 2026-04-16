import { Button } from "@/components/ui/button";
import { Mic, Paperclip, Send } from "lucide-react";

function ChatInputBox() {
  return (
    <div className="relative min-h-screen w-full">
      <div className="flex justify-center fixed bottom-0 left-0  mb-4 px-4 pb-4 w-full">
        <div className="w-full shadow-md rounded-xl border max-w-2xl p-3">
          <input
            type="text"
            placeholder="Ask me  anything..."
            className="border-none outline-none"
          />
          <div className="mt-5 flex items-center justify-between">
            <Button className="cursor-pointer" variant={"ghost"} size={"icon"}>
              <Paperclip className="h-5 w-5 " />
            </Button>

            <div className="flex gap-5">
              <Button
                className="cursor-pointer"
                variant={"ghost"}
                size={"icon"}
              >
                <Mic className="h-5 w-5 " />
              </Button>
              <Button className="cursor-pointer" size={"icon"}>
                <Send className="h-5 w-5 " />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatInputBox;

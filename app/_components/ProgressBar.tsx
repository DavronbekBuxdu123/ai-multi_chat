import { Progress } from "@/components/ui/progress";

function ProgressBar({ remainingToken }: { remainingToken: number }) {
  const safeRemaining = Math.max(0, Math.min(10, remainingToken));

  const totalTokens = 10;
  const usedTokens = totalTokens - safeRemaining;
  const progressValue = (usedTokens / totalTokens) * 100;

  return (
    <div className="p-3 rounded-2xl mb-5 border flex flex-col gap-3">
      <h2 className="text-lg font-extrabold">Free Plan</h2>
      <p className="text-gray-500">
        {usedTokens}/{totalTokens} messages used
      </p>
      <Progress value={progressValue} className="h-2" />
      <p className="text-xs text-muted-foreground italic">
        {safeRemaining} messages left
      </p>
    </div>
  );
}

export default ProgressBar;

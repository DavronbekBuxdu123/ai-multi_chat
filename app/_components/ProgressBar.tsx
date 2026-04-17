import { Progress } from "@/components/ui/progress";

function ProgressBar() {
  return (
    <div className="p-3 rounded-2xl mb-5 border flex flex-col gap-3">
      <h2 className="text-lg font-extrabold">Free Plan</h2>
      <p className="text-gray-500">0/5 messages used</p>
      <Progress value={33} />
    </div>
  );
}

export default ProgressBar;

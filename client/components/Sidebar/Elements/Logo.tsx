import { Sparkle } from "lucide-react";

export const Logo = () => {
  return (
    <div className="flex justify-center gap-2 pr-4 pb-2">
      <div className="flex items-center pb-2">
        <Sparkle size={32} color="#ff9f19" fill="#ff9f19" />
      </div>

      <div className="flex flex-col gap-7">
        <span className="h-0 text-2xl font-black">Spark-Hub</span>
        <span className="m-0 h-4 text-xs">Administration System</span>
      </div>
    </div>
  );
};

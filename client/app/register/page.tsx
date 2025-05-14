import { Button } from "@/components/ui/button";
import RegisterStaffForm from "./register";
import { Sparkle } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="h-full pb-20 flex items-center justify-center flex-col bg-background-2">
      <div className="flex items-center justify-center flex-col p-10 rounded-4xl bg-background shadow-lg">
        <div className="w-80">
          <div className="flex gap-2 pb-3 pl-4 border-b border-gray-300 mb-6">
            <div className="flex items-center pb-2">
              <Sparkle size={38} color="#ff9f19" fill="#ff9f19" />
            </div>
            <div className="flex flex-col gap-10">
              <span className="h-0 text-4xl font-black">Spark-Hub</span>
              <span className="m-0 h-4 mt-1 text-xs">
                Administration System
              </span>
            </div>
          </div>
          <h1 className="font-bold text-2xl pb-4">Register Staff</h1>
        </div>
        <div className="w-80">
          <RegisterStaffForm />
        </div>
        <div className="mt-4 flex flex-col items-center gap-2">
          <p className="text-sm text-primary/40">Have an account?</p>
          <Link href="/login" className="w-full">
            <Button type="submit" className="bg-orange-400 ">
              Login Staff
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

import ProfileForm from "./login-form";
import { Button } from "@/components/ui/button";
import { Sparkle } from "lucide-react";
import Link from "next/link";

const login = () => {
  return (
    <div className="h-full pb-20 flex items-center justify-center flex-col bg-background-2 ">
      <div className="flex items-center justify-center flex-col p-10 rounded-4xl bg-background shadow-lg">
        <div className="w-80 ">
          <div className="flex gap-2 pb-4 pl-4 border-b border-gray-300 mb-10">
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
          <h1 className="font-bold text-3xl pb-4">Login</h1>
        </div>
        <div className="w-80">
          <ProfileForm></ProfileForm>
        </div>
        <p className="mt-10 text-center text-sm w-20 text-primary/40">
          New here?
        </p>
        <Link href="/register">
          <Button className="bg-orange-400 ">Register Staff</Button>
        </Link>
      </div>
    </div>
  );
};
export default login;

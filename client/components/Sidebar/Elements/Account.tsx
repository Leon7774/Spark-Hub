"use client";

import { useState } from "react";
import AccountNav from "./Account-Nav";
import { EllipsisVertical } from "lucide-react";
import Image from "next/image";
import { useUser } from "@/context/userContext";

const AccountToggle = () => {
  const [visible, setVisible] = useState<boolean>(false);
  const user = useUser();

  return (
    <div className="mt-2 overflow-visible border-t border-gray-400 pt-2 pb-4">
      <button
        onClick={() => setVisible(!visible)}
        className="group relative flex h-10 w-full items-center gap-2 rounded p-0.5 pl-2 transition-colors hover:cursor-pointer hover:bg-gray-300"
      >
        <Image
          src="https://api.dicebear.com/9.x/dylan/svg?seed=Avery&backgroundColor[]"
          width={40}
          height={40}
          alt="avatar"
          className="rounded"
        />

        <div className="text-start">
          <span className="mb-0 block text-[10px] font-bold">
            {user?.email}
          </span>
          <span className="mt-0 block text-xs font-light">Manager</span>
        </div>
        <EllipsisVertical className="group-hover:rotate-90 transition-transform absolute right-4" />
      </button>
      <AccountNav visible={visible}></AccountNav>
    </div>
  );
};

export default AccountToggle;

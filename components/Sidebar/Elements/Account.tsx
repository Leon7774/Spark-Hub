import { useState } from "react";
import AccountNav from "./AccountNav";

const AccountToggle = () => {
  const [visible, setVisible] = useState<boolean>(false);

  return (
    <div className="mt-2 overflow-visible border-t border-gray-400 pt-2 pb-4">
      <button
        onClick={() => setVisible(!visible)}
        className="group relative flex h-10 w-full items-center gap-2 rounded p-0.5 pl-2 transition-colors hover:cursor-pointer hover:bg-gray-300"
      >
        <img
          src="https://api.dicebear.com/9.x/bottts-neutral/svg?seed=Andrea"
          alt="avatar"
          className="size-8 shrink-0 rounded bg-violet-500"
        />
        <div className="text-start">
          <span className="mb-0 block h-5 font-bold">Hello, John!</span>
          <span className="mt-0 block text-xs font-light">Manager</span>
        </div>
        <img
          src="client/src/assets/Icons/account-side.svg"
          className="absolute top-1.5 right-2 size-7 transition-transform group-hover:rotate-90"
          alt="icon"
        />
      </button>
      <AccountNav visible={visible}></AccountNav>
    </div>
  );
};

export default AccountToggle;

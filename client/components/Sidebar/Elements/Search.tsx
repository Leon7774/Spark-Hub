"use client";

import { useState } from "react";
import { Command } from "./Command";
import { SearchIcon } from "lucide-react";

export const Search = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="group flex items-center rounded-lg border border-accent bg-background-1 p-1 pl-2">
        <SearchIcon
          strokeWidth={3}
          className="text-gray-500 transition-colors duration-200 group-focus-within:text-black group-hover:text-black"
        />
        <input
          onFocus={(e) => {
            e.target.blur();
            setOpen(true);
          }}
          type="text"
          placeholder="Search"
          className="w-100 bg-transparent pl-2 focus:outline-none"
        />
        <span className="shadow-accent-foreground absolute right-2 flex h-6 items-center justify-center rounded bg-background-2 pr-2 pb-0.5 pl-2 font-mono text-xs font-black transition-all duration-300 ease-out group-focus-within:opacity-0">
          <span>Ctrl</span>
          <span className="pl-0.5 pr-0.5 font-extrabold">+</span>
          <span>J</span>
        </span>
      </div>
      <Command open={open} setOpen={setOpen}></Command>
    </>
  );
};

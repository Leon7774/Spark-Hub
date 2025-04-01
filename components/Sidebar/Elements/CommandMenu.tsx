"use client";

import { Command } from "cmdk";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { LogOut, Minus, Plus, View } from "lucide-react";

export const CommandMenu = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  // Toggle the menu when ⌘K is pressed
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "\\" && e.ctrlKey) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const [value, setValue] = useState("");

  return (
    <div className="">
      <Command.Dialog
        open={open}
        onOpenChange={setOpen}
        label="Global Command Menu"
        className="fixed inset-0 bg-stone-950/50"
        onClick={() => setOpen(false)}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="mx-auto mt-12 w-full max-w-lg overflow-hidden rounded-lg border border-stone-300 bg-white shadow-xl"
        >
          <Command.Input
            value={value}
            onValueChange={setValue}
            className="relative w-full border-b border-stone-300 p-3 text-lg placeholder:text-stone-400 focus:outline-none"
          />
          <Command.List className="p-2">
            <Command.Empty>
              <span className="text-orange-400">
                Nothing found for &quot;{value}&quot;
              </span>
            </Command.Empty>
            <Command.Group
              className="mb-3 text-sm text-stone-400"
              heading="Customer"
            >
              <Command.Item
                value="first-item"
                onSelect={() => console.log("First item selected!")}
                className="first-item flex cursor-pointer items-center gap-2 rounded p-2 text-sm text-stone-950 transition-colors hover:bg-stone-200"
              >
                <Plus size={12} strokeWidth={3} />
                Add Customer
              </Command.Item>
              <Command.Item className="c flex cursor-pointer items-center gap-2 rounded p-2 text-sm text-stone-950 transition-colors hover:bg-stone-200">
                <Minus size={12} strokeWidth={3}></Minus>
                Logout Customer
              </Command.Item>
              <Command.Item className="c flex cursor-pointer items-center gap-2 rounded p-2 text-sm text-stone-950 transition-colors hover:bg-stone-200">
                <View size={12} strokeWidth={3}></View>
                View Customer
              </Command.Item>
              <Command.Separator />
            </Command.Group>
            <Command.Group
              className="mb-3 text-sm text-stone-400"
              heading="Staff"
            >
              <Command.Item className="flex cursor-pointer items-center gap-2 rounded p-2 text-sm text-stone-950 transition-colors hover:bg-stone-200">
                <Plus size={12} strokeWidth={3} />
                Add Plan
              </Command.Item>
              <Command.Item className="c flex cursor-pointer items-center gap-2 rounded p-2 text-sm text-stone-950 transition-colors hover:bg-stone-200">
                <Minus size={12} strokeWidth={3}></Minus>
                Remove Plan
              </Command.Item>
              <Command.Item className="c flex cursor-pointer items-center gap-2 rounded p-2 text-sm text-stone-950 transition-colors hover:bg-stone-200">
                <LogOut size={12} strokeWidth={3}></LogOut>
                Logout
              </Command.Item>
              <Command.Separator />
            </Command.Group>
          </Command.List>
        </div>
      </Command.Dialog>
    </div>
  );
};

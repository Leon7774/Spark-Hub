"use client";

import { useState } from "react";
import { Command } from "./Command";

export const Search = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div onClick={() => setOpen(true)}>Search</div>
      <Command open={open} setOpen={setOpen}></Command>
    </>
  );
};

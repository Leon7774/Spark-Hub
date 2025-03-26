import { createContext } from "react";

export type ContentType =
  | "sessions"
  | "customers"
  | "transactions"
  | "log"
  | "gyatt";

export const PageContext = createContext<{
  content: ContentType;
  setContent: React.Dispatch<React.SetStateAction<ContentType>>;
}>({ content: "sessions", setContent: () => {} });

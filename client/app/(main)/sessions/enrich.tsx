import { BranchEnum, Session } from "@/lib/schemas";
import { z } from "zod";
import { DataProvider } from "@/context/dataContext";

export const enrichSessions = (sessions: Session[]): Session[] => {
  console.log(sessions);

  return sessions;
};

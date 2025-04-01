"use client";

import { Sidebar } from "@/components/Sidebar/Sidebar";
import { Content } from "@/components/Content/Content";
import { useState } from "react";
import { ContentType } from "@/context/context";
import { PageContext } from "@/context/context";
import { Button } from "@/components/ui/button";

function App() {
  const [content, setContent] = useState<ContentType>("sessions");

  return (
    <>
      <main className="grid grid-cols-[200px_1fr] gap-4 bg-gray-100 p-4 pt-3">
        <PageContext.Provider
          value={{ content: content, setContent: setContent }}
        >
          <Sidebar></Sidebar>
        </PageContext.Provider>
        <Content>
          {content === "sessions" && (
            <Button className="shadow bg-orange-500 border-green-600">
              HELLO
            </Button>
          )}
          {content === "customers" && "customers"}
          {content === "transactions" && "transactions"}
          {content === "log" && "log"}
        </Content>
      </main>
    </>
  );
}

export default App;

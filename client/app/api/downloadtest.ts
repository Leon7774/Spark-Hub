// test_supabase.ts
import "dotenv/config"; // 👈 loads .env.local
import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const { data, error } = await supabase.from("customers_public").select("*");
// console.log(data, error);

const downloadCSV = (data: any[]) => {
  const headers = Object.keys(data[0]).join(",");
  const rows = data.map((obj) => Object.values(obj).join(",")).join("\n");
  const csvContent = `${headers}\n${rows}`;

  fs.writeFileSync("sparkhub-backup.csv", csvContent);
  console.log("✅ CSV downloaded as sparkhub-backup.csv");
};

// Ensure data is defined before calling downloadCSV
if (data) {
  downloadCSV(data);
}

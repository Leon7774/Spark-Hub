import express from "express";
import { createClient } from "@supabase/supabase-js";

const app = express();
app.use(express.json());

const supabase = createClient(
  "https://your-project.supabase.co",
  "YOUR_SERVICE_ROLE_KEY"
);

app.post("/signup", async (req, res) => {
  const { username, password, masterPassword } = req.body;

  // Step 1: Get real master password from Supabase DB
  const { data, error } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "master_password")
    .single();

  if (error || !data || data.value !== masterPassword) {
    return res.status(401).json({ error: "Invalid master password" });
  }

  // Step 2: Create user
  const email = `${username}@yourapp.com`;
  const { data: user, error: createError } =
    await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

  if (createError) {
    return res.status(400).json({ error: createError.message });
  }

  res.json({ user });
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});

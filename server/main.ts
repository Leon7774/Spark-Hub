let { data: customers, error } = await supabase.from("customers").select("*");

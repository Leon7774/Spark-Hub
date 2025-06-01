import { toast } from "sonner";

export async function handleDeactivate(id: number | undefined) {
  if (!id) {
    toast.error("No plan ID provided. This is in the funtion");
    return;
  }
  const res = await fetch(`/api/plans/${id}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      delete: true,
    }),
  });
  if (res.ok) {
    toast.success("Plan deactivated successfully");
  } else {
    console.log(await res.text());
    toast.error("Failed to deactivate plan");
  }
}

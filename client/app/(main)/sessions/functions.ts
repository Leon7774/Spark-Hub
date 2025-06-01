import { toast } from "sonner";
import { mutate } from "swr";
import { Session } from "@/lib/schemas";

export async function getCustomerById(id: number) {
  const res = await fetch(`/api/customers/${id}`);
  if (!res.ok) {
    throw new Error("Customer not found");
  }
  const data = await res.json();
  toast.success("Customer retrieved successfully");
  return data;
}

/**
 * Gets a plan by its unique identifier.
 *
 * This function retrieves a plan by its unique identifier. It communicates with
 * the backend API to retrieve the plan data.
 *
 * @param id - The unique identifier of the plan to be retrieved.
 * @returns The plan object if the request is successful.
 * @throws error throw an error if the plan is not found or if the request fails.
 */
export async function getPlanById(id: number) {
  const res = await fetch(`/api/plan/${id}`);
  if (!res.ok) {
    throw new Error("Plan not found");
  }
  const data = await res.json();
  toast.success("Plan retrieved successfully");
  return data;
}

/**
 * Ends a user's session by logging them out.
 *
 * This function logs out a session by its unique identifier. It communicates
 * with the backend API to end the session and remove any associated session data.
 *
 * @param id - The unique identifier of the session to be logged out.
 * @throws error throw an error if the session logout fails.
 */

export async function sessionLogout(session: Session) {
  if (session.plan_type === "bundle") {
    const subscription = await fetch(
      `/api/subscription/${session.subscription?.id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          delete: true,
        }),
      },
    );
    if (subscription.ok) {
    }
  }

  const res = await fetch(`api/session/${id}/logout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (res.status !== 200) {
    throw new Error("Session logout failed");
  }
  toast.success("Session logged out successfully");
  await mutate("/api/session");
}

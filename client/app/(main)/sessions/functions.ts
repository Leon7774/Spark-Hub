export async function getCustomerById(id: number) {
  const res = await fetch(`/api/customers/${id}`);
  if (!res.ok) {
    throw new Error("Customer not found");
  }
  const data = await res.json();
  return data;
}

export async function getPlanById(id: number) {
  const res = await fetch(`/api/plan/${id}`);
  if (!res.ok) {
    throw new Error("Plan not found");
  }
  const data = await res.json();
  return data;
}

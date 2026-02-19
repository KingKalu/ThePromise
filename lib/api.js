const baseUrl =
  typeof window === "undefined" ? process.env.NEXT_PUBLIC_API_URL : "";

async function apiGet(path) {
  const res = await fetch(`${baseUrl}${path}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Request failed");
  return res.json();
}

async function apiPost(path, body) {
  const res = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error("Request failed");
  return res.json();
}

async function apiPatch(path, body) {
  const res = await fetch(`${baseUrl}${path}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error("Request failed");
  return res.json();
}

export const getBranches = () => apiGet("/api/branches");
export const getMenu = () => apiGet("/api/menu");
export const getOrders = branchId =>
  apiGet(branchId ? `/api/orders?branchId=${branchId}` : "/api/orders");
export const createOrder = payload => apiPost("/api/orders", payload);
export const updateOrderStatus = (id, status) =>
  apiPatch(`/api/orders/${id}/status`, { status });
export const getOverviewAnalytics = () => apiGet("/api/analytics/overview");
export const sendChatMessage = payload => apiPost("/api/chat", payload);

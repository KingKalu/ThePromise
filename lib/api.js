function resolveBaseUrl() {
  const configured = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");
  if (typeof window !== "undefined") return "";
  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (vercelUrl) return `https://${vercelUrl.replace(/\/$/, "")}`;
  return "http://localhost:3000";
}

function buildUrl(path) {
  return `${resolveBaseUrl()}${path}`;
}

async function parseError(res) {
  const text = await res.text().catch(() => "");
  return text || res.statusText || "Request failed";
}

async function apiGet(path) {
  const res = await fetch(buildUrl(path), { cache: "no-store" });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

async function apiPost(path, body) {
  const res = await fetch(buildUrl(path), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

async function apiPatch(path, body) {
  const res = await fetch(buildUrl(path), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export const getBranches = () => apiGet("/api/branches");
export const getMenu = () => apiGet("/api/menu");
export const getOrders = (branchId) =>
  apiGet(branchId ? `/api/orders?branchId=${branchId}` : "/api/orders");
export const createOrder = (payload) => apiPost("/api/orders", payload);
export const updateOrderStatus = (id, status) =>
  apiPatch(`/api/orders/${id}/status`, { status });
export const getOverviewAnalytics = () => apiGet("/api/analytics/overview");
export const sendChatMessage = (payload) => apiPost("/api/chat", payload);

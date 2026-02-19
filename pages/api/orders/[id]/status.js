import { updateOrderStatus } from "@/lib/store";

function readOrderId(queryValue) {
  if (Array.isArray(queryValue)) return queryValue[0];
  return queryValue;
}

export default function handler(req, res) {
  if (req.method !== "PATCH") {
    res.setHeader("Allow", ["PATCH"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  const id = readOrderId(req.query.id);
  try {
    const updated = updateOrderStatus(id, req.body?.status);
    if (!updated) {
      return res.status(404).json({ error: "Order not found" });
    }
    return res.status(200).json(updated);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}

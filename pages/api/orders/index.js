import { createOrder, listOrders } from "@/lib/store";

function readBranchId(queryValue) {
  if (Array.isArray(queryValue)) return queryValue[0];
  return queryValue;
}

export default function handler(req, res) {
  if (req.method === "GET") {
    const branchId = readBranchId(req.query.branchId);
    return res.status(200).json(listOrders(branchId));
  }

  if (req.method === "POST") {
    try {
      const order = createOrder(req.body);
      return res.status(201).json(order);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).json({ error: "Method not allowed" });
}

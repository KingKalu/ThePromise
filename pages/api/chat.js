import { getChatReply } from "@/lib/store";

export default function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    return res.status(200).json(getChatReply(req.body));
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}

import type { NextApiRequest, NextApiResponse } from "next";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });
  const { adminPassword } = req.body;
  if (!adminPassword)
    return res.status(400).json({ error: "Missing adminPassword" });
  if (adminPassword !== ADMIN_PASSWORD)
    return res.status(401).json({ error: "Unauthorized" });
  return res.status(200).json({ success: true });
}

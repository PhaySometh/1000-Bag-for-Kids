import type { NextApiRequest, NextApiResponse } from "next";
import { getServerClient } from "../../../utils/supabaseClient";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Use service role key for reading messages
    const supabase = getServerClient(process.env.SUPABASE_SERVICE_ROLE_KEY);

    const { status } = req.query;

    // Build query
    let query = supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);

    // Filter by status if provided
    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ error: "Failed to fetch messages" });
    }

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

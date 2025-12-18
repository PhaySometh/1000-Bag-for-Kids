import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../../utils/supabaseClient";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { name, message } = req.body;

    // Validation
    if (!name || !message) {
      return res.status(400).json({
        error: "Name and message are required",
      });
    }

    // Insert message into Supabase
    const { data, error } = await supabase
      .from("messages")
      .insert([
        {
          name,
          message,
        },
      ])
      .select();

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ error: "Failed to save message" });
    }

    return res.status(201).json({
      success: true,
      data: data[0],
    });
  } catch (error) {
    console.error("Error saving message:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

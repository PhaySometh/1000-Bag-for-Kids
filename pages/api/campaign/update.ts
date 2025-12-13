import type { NextApiRequest, NextApiResponse } from "next";
import { getServerClient } from "../../../utils/supabaseClient";
import fs from "fs";
import path from "path";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });
  const { adminPassword, change, manual, goal, title } = req.body;
  if (adminPassword !== ADMIN_PASSWORD)
    return res.status(401).json({ error: "Unauthorized" });

  try {
    const useLocal = !process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabase = useLocal ? null : getServerClient();
    // fetch current
    let currentData: any = null;
    let fetchErr: any = null;
    if (supabase) {
      const res = await supabase.from("campaign").select("*").limit(1).single();
      currentData = res.data;
      fetchErr = res.error;
      if (fetchErr) {
        // if we can't fetch from supabase, allow local fallback if exists
        try {
          const localFile = path.join(process.cwd(), "data", "campaign.json");
          if (fs.existsSync(localFile)) {
            const raw = fs.readFileSync(localFile, "utf-8");
            currentData = JSON.parse(raw);
            fetchErr = null;
          }
        } catch (e) {
          // keep fetchErr
        }
      }
    } else {
      // local file fallback
      try {
        const localFile = path.join(process.cwd(), "data", "campaign.json");
        if (fs.existsSync(localFile)) {
          const raw = fs.readFileSync(localFile, "utf-8");
          currentData = JSON.parse(raw);
        } else {
          currentData = { current_bags: 0 };
        }
      } catch (err) {
        fetchErr = err;
      }
    }
    if (fetchErr && !currentData) {
      return res.status(500).json({ error: fetchErr.message });
    }
    const current_bags = currentData?.current_bags ?? 0;
    let newCount = current_bags;
    let newGoal = currentData?.goal ?? 5000;
    let newTitle = currentData?.title ?? "";
    if (typeof manual === "number") newCount = manual;
    else if (typeof change === "number")
      newCount = Math.max(0, current_bags + change);
    if (typeof goal === "number") {
      // ensure non-negative integer
      newGoal = Math.max(0, Math.round(goal));
    }
    if (typeof title === "string") newTitle = title;

    const updated: any = {
      current_bags: newCount,
      last_updated: new Date().toISOString(),
    };
    if (typeof newGoal === "number") updated.goal = newGoal;
    if (typeof newTitle === "string") updated.title = newTitle;

    // upsert
    if (supabase) {
      const { data, error } = await supabase
        .from("campaign")
        .upsert({ id: "default", ...currentData, ...updated });
      if (error) {
        // fallback to local if possible
        try {
          const localDir = path.join(process.cwd(), "data");
          if (!fs.existsSync(localDir)) fs.mkdirSync(localDir);
          const localFile = path.join(localDir, "campaign.json");
          const current = currentData || { current_bags: 0, goal: 5000 };
          const out = { ...current, ...updated };
          fs.writeFileSync(localFile, JSON.stringify(out, null, 2), "utf-8");
          return res
            .status(200)
            .json({ success: true, data: updated, _source: "local" });
        } catch (e) {
          return res.status(500).json({ error: error.message });
        }
      }
    } else {
      // write local file
      try {
        const localDir = path.join(process.cwd(), "data");
        if (!fs.existsSync(localDir)) fs.mkdirSync(localDir);
        const localFile = path.join(localDir, "campaign.json");
        const current = currentData || {
          current_bags: 0,
          goal: 5000,
          title: "",
        };
        const out = { ...current, ...updated };
        fs.writeFileSync(localFile, JSON.stringify(out, null, 2), "utf-8");
        return res
          .status(200)
          .json({ success: true, data: updated, _source: "local" });
      } catch (err) {
        return res.status(500).json({ error: "Failed to write local file" });
      }
    }

    return res
      .status(200)
      .json({ success: true, data: updated, _source: "supabase" });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

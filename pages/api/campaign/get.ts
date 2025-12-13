import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../../utils/supabaseClient";
import fs from "fs";
import path from "path";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const useLocal = !process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (useLocal) {
      // read local fallback
      try {
        const local = path.join(process.cwd(), "data", "campaign.json");
        if (fs.existsSync(local)) {
          const raw = fs.readFileSync(local, "utf-8");
          const parsed = JSON.parse(raw);
          return res.status(200).json({ ...parsed, _source: "local" });
        }
      } catch (err) {
        // ignore and fallthrough to seed
      }
    }

    const { data, error } = await supabase
      .from("campaign")
      .select("*")
      .limit(1)
      .single();
    if (error) {
      // if there's an error from supabase, try local fallback before failing
      try {
        const local = path.join(process.cwd(), "data", "campaign.json");
        if (fs.existsSync(local)) {
          const raw = fs.readFileSync(local, "utf-8");
          const parsed = JSON.parse(raw);
          return res.status(200).json({ ...parsed, _source: "local" });
        }
      } catch (e) {
        // fallback not available; return supabase error
      }
      return res.status(500).json({ error: error.message });
    }

    if (!data) {
      // seed default
      const seed = {
        id: "default",
        title: "មូលនិធិ៥ពាន់កាបូបនៃស្នាមញញឹម",
        subtitle: "សម្រាប់ក្មេងៗភៀសសឹក",
        current_bags: 0,
        goal: 5000,
          donation_items: [
          "អាវរងារ និង សំលៀកបំពាក់ផ្សេងៗ",
          "ភេសជ្ជៈនំចំណី",
          "សៀវភៅសម្រាប់អាន",
          "សម្ភារៈសម្រាប់សរសេរ និងគូរ",
          "សម្ភារៈក្មេងលេង",
        ],
        location_url: "",
        school_name: "",
        last_updated: new Date().toISOString(),
      };
      // if we have a local file, prefer that for dev
      try {
        const local = path.join(process.cwd(), "data", "campaign.json");
        if (fs.existsSync(local)) {
          const raw = fs.readFileSync(local, "utf-8");
          const parsed = JSON.parse(raw);
          return res.status(200).json({ ...parsed, _source: "local" });
        }
      } catch (err) {
        // ignore
      }
      return res.status(200).json(seed);
    }
    return res.status(200).json({ ...data, _source: "supabase" });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

import type { NextApiRequest, NextApiResponse } from 'next';

// Resolve a Google Maps short/share URL, return an embeddable map and a direction URL
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { url } = req.query;
  const defaultLoc = 'Phnom Penh';
  if (!url || typeof url !== 'string') {
    return res.status(200).json({
      embedUrl: `https://www.google.com/maps?q=${encodeURIComponent(defaultLoc)}&output=embed`,
      directionUrl: `https://www.google.com/maps?q=${encodeURIComponent(defaultLoc)}`,
    });
  }

  try {
    // Fetch the URL and follow redirects to get final URL (server-side fetch)
    const response = await fetch(url, { redirect: 'follow' });
    const finalUrl = response.url || url;
    // If the final URL is already an embed (contains /embed?pb=) then return it directly
    if (finalUrl.includes('/maps/embed')) {
      // direction link: use the finalUrl as reference for user's convenience
      const directionUrl = finalUrl.replace('/maps/embed', '/maps');
      return res.status(200).json({ embedUrl: finalUrl, directionUrl, finalUrl });
    }

    // Try to extract coordinates
    let lat: string | null = null;
    let lng: string | null = null;

      // Prefer exact coordinates from !3dLAT!4dLNG if present (more precise)
      const dMatch = finalUrl.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
      if (dMatch) {
        const lat = dMatch[1];
        const lng = dMatch[2];
        const embedUrl = `https://www.google.com/maps?q=${lat},${lng}&z=16&output=embed`;
        const directionUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
        return res.status(200).json({ embedUrl, directionUrl, finalUrl });
      }
      // If URL contains @lat,lng segment (map center or viewport) use it as fallback
      const match = finalUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (match) {
        const lat = match[1];
        const lng = match[2];
        return res.status(200).json({ embedUrl: `https://www.google.com/maps?q=${lat},${lng}&z=16&output=embed`, directionUrl: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, finalUrl });
      }

    // Pattern: !3dLAT!4dLNG
    if (!lat || !lng) {
      const dMatch = finalUrl.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
      if (dMatch) {
        lat = dMatch[1];
        lng = dMatch[2];
      }
    }

    // center=lat,lng
    if (!lat || !lng) {
      const centerMatch = finalUrl.match(/center=(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (centerMatch) {
        lat = centerMatch[1];
        lng = centerMatch[2];
      }
    }

    // If found coordinates, create embed and direction URLs
    if (lat && lng) {
      const embedUrl = `https://www.google.com/maps?q=${lat},${lng}&output=embed`;
      const directionUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
      return res.status(200).json({ embedUrl, directionUrl, finalUrl });
    }

    // If it contains a q parameter use it
    let q = null;
    try {
      const u = new URL(finalUrl);
      q = u.searchParams.get('q');
    } catch (err) {
      q = null;
    }
    if (q) {
      const embedUrl = `https://www.google.com/maps?q=${encodeURIComponent(q)}&output=embed`;
      const directionUrl = `https://www.google.com/maps?q=${encodeURIComponent(q)}`;
      return res.status(200).json({ embedUrl, directionUrl, finalUrl });
    }

    // fallback: use finalUrl in the q parameter
    const embedUrl = `https://www.google.com/maps?q=${encodeURIComponent(finalUrl)}&output=embed`;
    const directionUrl = `https://www.google.com/maps?q=${encodeURIComponent(finalUrl)}`;
    return res.status(200).json({ embedUrl, directionUrl, finalUrl });
  } catch (err) {
    const embedUrl = `https://www.google.com/maps?q=${encodeURIComponent(defaultLoc)}&output=embed`;
    const directionUrl = `https://www.google.com/maps?q=${encodeURIComponent(defaultLoc)}`;
    return res.status(200).json({ embedUrl, directionUrl, finalUrl: url });
  }
}

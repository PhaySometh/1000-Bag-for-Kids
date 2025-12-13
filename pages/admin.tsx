import { useEffect, useState } from "react";

type Campaign = {
  current_bags: number;
  goal: number;
  last_updated?: string;
  _source?: string;
};

export default function Admin() {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [manual, setManual] = useState<number | "">("");

  async function load() {
    const res = await fetch("/api/campaign/get");
    const data = await res.json();
    setCampaign(data);
  }

  useEffect(() => {
    load();
  }, []);

  async function checkAuth() {
    setErrorMsg(null);
    try {
      const res = await fetch("/api/admin/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminPassword: password }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setErrorMsg(json.error || "Unauthorized");
        setAuthenticated(false);
        return;
      }
      setAuthenticated(true);
      setErrorMsg(null);
    } catch (err) {
      setErrorMsg("Validation request failed");
      setAuthenticated(false);
    }
  }

  async function update(change = 0, manualValue?: number) {
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await fetch("/api/campaign/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminPassword: password,
          change: change,
          manual: manualValue,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setErrorMsg(json.error || "Update failed");
      } else {
        setSuccessMsg(
          "Updated successfully (" + (json._source ?? "unknown") + ")"
        );
      }
      await load();
    } catch (err) {
      setErrorMsg("Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <main className="max-w-2xl mx-auto">
        <div className="card">
          <h1 className="text-xl font-bold text-darkBlue">Admin Panel</h1>
          <p className="text-sm text-gray-600">
            Update progress metrics for the campaign.
          </p>
          <div className="mt-2 text-sm">
            <a href="/" className="text-primary underline">
              Back to site
            </a>
          </div>
          {!authenticated && (
            <div className="mt-4">
              <input
                className="border p-2 rounded w-full"
                type="password"
                placeholder="Admin Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {errorMsg && (
                <div className="mt-2 text-sm text-red-600">{errorMsg}</div>
              )}
              <button
                className="mt-3 w-full bg-primary text-white p-2 rounded"
                onClick={checkAuth}
              >
                Sign In
              </button>
            </div>
          )}

          {authenticated && (
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600">Current</div>
                  <div className="text-2xl font-bold">
                    {campaign?.current_bags ?? 0}
                  </div>
                </div>
                <div className="text-right text-xs text-gray-500">
                  Last updated:{" "}
                  {campaign?.last_updated
                    ? new Date(campaign.last_updated).toLocaleString()
                    : "—"}
                  <br />
                  Data: {campaign?._source ?? "unknown"}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  className="flex-1 bg-primary text-white p-2 rounded"
                  onClick={() => update(1)}
                  disabled={loading}
                >
                  +1
                </button>
                <button
                  className="flex-1 bg-primary text-white p-2 rounded"
                  onClick={() => update(5)}
                  disabled={loading}
                >
                  +5
                </button>
                <button
                  className="flex-1 bg-primary text-white p-2 rounded"
                  onClick={() => update(10)}
                  disabled={loading}
                >
                  +10
                </button>
              </div>

              <div className="flex gap-2">
                <input
                  className="flex-1 border p-2 rounded"
                  type="number"
                  value={manual ?? ""}
                  onChange={(e) =>
                    setManual(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                  placeholder="Set total bags (manual)"
                />
                <button
                  className="bg-primary text-white p-2 rounded"
                  onClick={() =>
                    update(0, typeof manual === "number" ? manual : undefined)
                  }
                  disabled={loading}
                >
                  Set
                </button>
              </div>
              <div className="flex gap-2 items-center">
                {errorMsg && (
                  <div className="text-sm text-red-600">{errorMsg}</div>
                )}
                {successMsg && (
                  <div className="text-sm text-green-600">{successMsg}</div>
                )}
                <button
                  className="flex-1 border text-sm p-2 rounded"
                  onClick={() => {
                    setAuthenticated(false);
                    setPassword("");
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

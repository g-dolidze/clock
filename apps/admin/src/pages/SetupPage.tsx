import { useState, type FormEvent } from "react";
import { Button, Card } from "@ontime/web-shared";
import { useSessionStore } from "../store/sessionStore";

export function SetupPage() {
  const setAdminKey = useSessionStore((s) => s.setAdminKey);
  const [key, setKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setChecking(true);
    setError(null);
    const res = await fetch("/v1/admin/restaurants", { headers: { "x-admin-key": key } });
    setChecking(false);
    if (!res.ok) {
      setError("That admin key was rejected.");
      return;
    }
    setAdminKey(key);
  }

  return (
    <div className="mx-auto max-w-sm py-16">
      <h1 className="mb-2 text-2xl font-black text-white">ontime.ge admin</h1>
      <p className="mb-6 text-sm text-white/60">Platform-wide view across every restaurant.</p>
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="admin-key" className="mb-1 block text-sm font-medium text-white/80">
              Admin key
            </label>
            <input
              id="admin-key"
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="dev-admin-key"
              className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#e3572c]"
            />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <Button type="submit" loading={checking} className="w-full">
            Enter admin console
          </Button>
        </form>
      </Card>
    </div>
  );
}

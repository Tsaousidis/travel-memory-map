// Local protocol fixture, not Supabase and not a JWT/RLS security emulator.
// No emails are sent and no real project is contacted.
import { createServer } from "node:http";
import { createHash, randomUUID } from "node:crypto";

const sessions = new Map();
const refreshTokens = new Map();
const profiles = new Map();
const pendingConfirmations = new Map();
const users = ["alice", "bob", "expired"].map((name, i) => ({
  id: `00000000-0000-4000-8000-00000000000${i + 1}`,
  email: `${name}@example.test`,
  aud: "authenticated",
  role: "authenticated",
  app_metadata: { provider: "email" },
  user_metadata: { display_name: name === "bob" ? "Bob" : "Alice" },
  created_at: "2026-01-01T00:00:00Z",
}));

function session(user, expired = false) {
  const exp = Math.floor(Date.now() / 1000) + (expired ? -60 : 3600);
  const encode = (v) => Buffer.from(JSON.stringify(v)).toString("base64url");
  const token = `${encode({ alg: "HS256", typ: "JWT" })}.${encode({ sub: user.id, exp, aud: "authenticated", role: "authenticated", nonce: randomUUID() })}.fixture`;
  const refresh = randomUUID();
  sessions.set(token, user);
  refreshTokens.set(refresh, user);
  return { access_token: token, refresh_token: refresh, token_type: "bearer", expires_in: expired ? -60 : 3600, expires_at: exp, user };
}

createServer(async (req, res) => {
  const url = new URL(req.url, "http://127.0.0.1:54329");
  let raw = "";
  for await (const chunk of req) raw += chunk;
  const body = raw ? JSON.parse(raw) : {};
  const send = (code, data) => { res.writeHead(code, { "Content-Type": "application/json" }); res.end(JSON.stringify(data)); };
  if (url.pathname === "/health") return send(200, { ok: true });
  if (url.pathname === "/__test/confirmation") {
    return send(200, { callback: pendingConfirmations.get(url.searchParams.get("email"))?.callback });
  }
  if (url.pathname === "/auth/v1/signup") {
    const callback = new URL(url.searchParams.get("redirect_to"));
    callback.searchParams.set("code", "signup-roundtrip-code");
    pendingConfirmations.set(body.email, { callback: callback.toString(), challenge: body.code_challenge });
    return send(200, { user: { ...users[0], email: body.email }, session: null });
  }
  if (url.pathname === "/auth/v1/token") {
    const grant = url.searchParams.get("grant_type");
    if (grant === "password") {
      const user = users.find((u) => u.email === body.email);
      if (user && body.password === "Fixture-password-123") return send(200, session(user, user.email.startsWith("expired")));
    }
    if (grant === "refresh_token" && refreshTokens.has(body.refresh_token)) return send(200, session(refreshTokens.get(body.refresh_token)));
    if (grant === "pkce" && body.auth_code === "valid-fixture-code" && body.code_verifier) return send(200, session(users[0]));
    if (grant === "pkce" && body.auth_code === "signup-roundtrip-code" && body.code_verifier) {
      const challenge = createHash("sha256").update(body.code_verifier).digest("base64url");
      if ([...pendingConfirmations.values()].some((flow) => flow.challenge === challenge)) return send(200, session(users[0]));
    }
    return send(400, { code: "invalid_credentials", msg: "Invalid credentials" });
  }
  const token = (req.headers.authorization || "").replace(/^Bearer /, "");
  const user = sessions.get(token);
  if (url.pathname === "/auth/v1/user") return user ? send(200, user) : send(401, { code: "bad_jwt", msg: "Invalid token" });
  if (url.pathname === "/auth/v1/logout") { sessions.delete(token); return send(200, {}); }
  if (url.pathname === "/rest/v1/profiles") {
    if (!user) return send(401, {});
    if (req.method === "POST") {
      if (body.id !== user.id) return send(403, {});
      if (!profiles.has(user.id)) profiles.set(user.id, body);
      return send(201, null);
    }
    const profile = url.searchParams.get("id") === `eq.${user.id}` ? profiles.get(user.id) : null;
    if (req.headers.accept?.includes("vnd.pgrst.object")) return profile ? send(200, profile) : send(406, { code: "PGRST116" });
    return send(200, profile ? [profile] : []);
  }
  return send(404, {});
}).listen(54329, "127.0.0.1");

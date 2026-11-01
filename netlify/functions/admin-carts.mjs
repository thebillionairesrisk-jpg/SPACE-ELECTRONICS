// Secure administrator-only cart monitor.
// Set SUPABASE_URL, SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY in Netlify environment variables.
// The service role key must NEVER be placed in browser files.
export default async (request) => {
  const headers = { "content-type": "application/json", "cache-control": "no-store" };
  const reply = (status, body) => new Response(JSON.stringify(body), { status, headers });
  if (request.method !== "GET") return reply(405, { error: "Method not allowed" });
  const url = process.env.SUPABASE_URL;
  const anon = process.env.SUPABASE_ANON_KEY;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const token = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  if (!url || !anon || !service) return reply(500, { error: "Missing Supabase environment variables in Netlify." });
  if (!token) return reply(401, { error: "Please sign in." });

  const userRes = await fetch(`${url}/auth/v1/user`, {
    headers: { apikey: anon, Authorization: `Bearer ${token}` }
  });
  if (!userRes.ok) return reply(401, { error: "Invalid or expired login." });
  const user = await userRes.json();

  const profileRes = await fetch(`${url}/rest/v1/profiles?id=eq.${encodeURIComponent(user.id)}&select=role`, {
    headers: { apikey: service, Authorization: `Bearer ${service}` }
  });
  const profiles = await profileRes.json();
  if (!profileRes.ok || profiles?.[0]?.role !== "admin") return reply(403, { error: "Administrator access required." });

  // Expected relation: carts -> cart_items -> products. Adjust select if your actual FK relation names differ.
  const cartsRes = await fetch(`${url}/rest/v1/carts?select=*,cart_items(*,products(name,price,image_url))&order=created_at.desc&limit=100`, {
    headers: { apikey: service, Authorization: `Bearer ${service}` }
  });
  const carts = await cartsRes.json();
  if (!cartsRes.ok) return reply(500, { error: carts?.message || "Could not read carts. Check table relationships and column names." });
  return reply(200, { carts });
};
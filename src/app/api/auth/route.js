export const dynamic = "force-dynamic";

export async function POST(request) {
  const { username, password, space } = await request.json();

  if (space === "yoshi") {
    // Yoshi auth is handled by the backend (self-registration)
    return Response.json({ ok: false, error: "use /api/yoshi/login" }, { status: 400 });
  }

  // Carles (admin) auth
  if (
    username === process.env.AGORA_USERNAME &&
    password === process.env.AGORA_PASSWORD
  ) {
    return Response.json({ ok: true, space: "agora" });
  }
  return Response.json({ ok: false }, { status: 401 });
}

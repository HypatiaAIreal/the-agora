export const dynamic = "force-dynamic";

export async function POST(request) {
  const { username, password } = await request.json();
  if (
    username === process.env.AGORA_USERNAME &&
    password === process.env.AGORA_PASSWORD
  ) {
    return Response.json({ ok: true });
  }
  return Response.json({ ok: false }, { status: 401 });
}

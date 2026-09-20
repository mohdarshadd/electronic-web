import { getPublicSettings } from "@/lib/settings";

export async function GET() {
  return Response.json({ settings: getPublicSettings() });
}
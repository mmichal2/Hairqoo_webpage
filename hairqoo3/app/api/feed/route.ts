import { NextResponse } from "next/server";
import { getFeedPage } from "@/core/data/queries";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get("cursor");
  const page = getFeedPage(cursor);
  return NextResponse.json(page);
}

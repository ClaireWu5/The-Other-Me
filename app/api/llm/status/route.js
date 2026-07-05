import { NextResponse } from "next/server";
import { getPublicLlmStatus } from "@/lib/llm";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(getPublicLlmStatus());
}

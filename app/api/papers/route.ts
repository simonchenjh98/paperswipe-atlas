import { NextRequest, NextResponse } from "next/server";
import { searchOpenAlex } from "../../../lib/openalex";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("query")?.trim() || "";
  const mode = request.nextUrl.searchParams.get("mode") === "trending" ? "trending" : "search";
  const count = Number(request.nextUrl.searchParams.get("count")) || 8;
  if (mode === "search" && !query) {
    return NextResponse.json({ error: "请输入研究主题" }, { status: 400 });
  }

  try {
    return NextResponse.json(await searchOpenAlex({ query, mode, count }));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "实时检索暂不可用" }, { status: 502 });
  }
}

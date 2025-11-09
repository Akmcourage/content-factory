import { NextResponse } from "next/server"

import {
  deleteTopicHistory,
  listTopicHistory,
  saveTopicHistory,
  type SaveTopicHistoryPayload,
} from "@/lib/topics"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const items = listTopicHistory()
    return NextResponse.json({ data: items })
  } catch (error) {
    return NextResponse.json(
      { message: "查询历史记录失败", details: String(error) },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  let payload: SaveTopicHistoryPayload

  try {
    const body = await request.json()
    payload = {
      keyword: String(body.keyword ?? "").trim(),
      dataSource: body.dataSource === "remote" ? "remote" : "mock",
      total: typeof body.total === "number" ? body.total : undefined,
      totalPage: typeof body.totalPage === "number" ? body.totalPage : undefined,
      page: typeof body.page === "number" ? body.page : undefined,
      rawCutWords: typeof body.rawCutWords === "string" ? body.rawCutWords : undefined,
      articles: Array.isArray(body.articles) ? body.articles : [],
      topLiked: Array.isArray(body.topLiked) ? body.topLiked : [],
      topEngagement: Array.isArray(body.topEngagement) ? body.topEngagement : [],
      keywordCloud: Array.isArray(body.keywordCloud) ? body.keywordCloud : [],
      insights: Array.isArray(body.insights) ? body.insights : [],
    }
  } catch (error) {
    return NextResponse.json(
      { message: "请求体需要为JSON格式", details: String(error) },
      { status: 400 },
    )
  }

  if (!payload.keyword) {
    return NextResponse.json({ message: "keyword 不能为空" }, { status: 400 })
  }

  try {
    const id = saveTopicHistory(payload)
    const items = listTopicHistory()
    return NextResponse.json({ data: { id }, history: items }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { message: "保存历史记录失败", details: String(error) },
      { status: 500 },
    )
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const idParam = searchParams.get("id")
  const id = Number(idParam)

  if (!id || Number.isNaN(id)) {
    return NextResponse.json({ message: "缺少有效的 id" }, { status: 400 })
  }

  try {
    deleteTopicHistory(id)
    const items = listTopicHistory()
    return NextResponse.json({ data: { id }, history: items })
  } catch (error) {
    return NextResponse.json(
      { message: "删除历史记录失败", details: String(error) },
      { status: 500 },
    )
  }
}

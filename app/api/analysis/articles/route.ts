import { NextResponse } from "next/server"

import {
  API_ENDPOINT,
  type ApiResponse,
  type ArticleSearchParams,
  buildPayload,
  mapDatumToArticle,
} from "@/lib/analysis"

const FALLBACK_API_KEY = "123308c85923b12f9e0"

const API_KEY = process.env.DAJIALA_API_KEY || FALLBACK_API_KEY

export async function POST(request: Request) {
  let body: Partial<ArticleSearchParams> = {}

  try {
    body = await request.json()
  } catch (error) {
    return NextResponse.json(
      { message: "请求体需要为JSON格式", details: String(error) },
      { status: 400 },
    )
  }

  const keyword = readText(body.keyword) || readText(body.kw)

  if (!keyword) {
    return NextResponse.json(
      { message: "请输入关键词keyword" },
      { status: 400 },
    )
  }

  const params: ArticleSearchParams = {
    keyword,
    period: clampNumber(body.period, 7, 1, 30),
    page: clampNumber(body.page, 1, 1),
    size: clampNumber(body.size, 10, 1, 50),
    sortType: clampNumber(body.sortType ?? body.sort_type, 1),
    mode: clampNumber(body.mode, 1),
    type: clampNumber(body.type, 1),
    anyKeyword: readOptionalText(body.anyKeyword ?? body.any_kw),
    excludeKeyword: readOptionalText(body.excludeKeyword ?? body.ex_kw),
  }

  const payload = buildPayload(params, API_KEY)

  try {
    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      return NextResponse.json(
        { message: "第三方服务暂时不可用", statusText: response.statusText },
        { status: 502 },
      )
    }

    const data = (await response.json()) as ApiResponse

    if (data.code !== 200) {
      return NextResponse.json(
        {
          message: data.msg || "第三方服务返回异常",
          code: data.code,
        },
        { status: 502 },
      )
    }

    const articles = (data.data ?? []).map(mapDatumToArticle)

    return NextResponse.json({
      data: {
        articles,
        total: data.total ?? articles.length,
        totalPage: data.total_page ?? 1,
        page: data.page ?? params.page ?? 1,
        rawCutWords: data.cut_words ?? "",
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        message: "获取公众号文章失败",
        details: String(error),
      },
      { status: 500 },
    )
  }
}

function clampNumber(
  value: unknown,
  fallback: number,
  min = 1,
  max = Number.POSITIVE_INFINITY,
) {
  const parsed = typeof value === "number" ? value : Number.parseInt(String(value ?? ""), 10)

  if (Number.isNaN(parsed)) {
    return fallback
  }

  return Math.max(min, Math.min(max, parsed))
}

function readText(value: unknown) {
  if (typeof value === "string") {
    return value.trim()
  }
  if (typeof value === "number") {
    return String(value).trim()
  }
  return ""
}

function readOptionalText(value: unknown) {
  const text = readText(value)
  return text.length ? text : undefined
}

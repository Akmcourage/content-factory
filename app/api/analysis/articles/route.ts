import { NextResponse } from "next/server"

import mockKwSearch from "@/need/mock_kw_search.json"

import {
  API_ENDPOINT,
  type ApiResponse,
  type ArticleSearchParams,
  buildPayload,
  mapDatumToArticle,
} from "@/lib/analysis"

const FALLBACK_API_KEY = "123308c85923b12f9e0"

const API_KEY = process.env.DAJIALA_API_KEY || FALLBACK_API_KEY
const USE_MOCK_DATA = process.env.USE_KW_SEARCH_MOCK !== "false"

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

  if (USE_MOCK_DATA) {
    const mockResponse = buildMockApiResponse(keyword, params)
    return NextResponse.json(buildClientResponse(mockResponse, params, "mock"))
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

    if (!isSuccessCode(data.code)) {
      return NextResponse.json(
        {
          message: data.msg || "第三方服务返回异常",
          code: data.code,
        },
        { status: 502 },
      )
    }

    return NextResponse.json(buildClientResponse(data, params, "remote"))
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

function buildMockApiResponse(keyword: string, params: ArticleSearchParams): ApiResponse {
  const baseResponse = mockKwSearch as ApiResponse
  const dataset = Array.isArray(baseResponse.data) ? baseResponse.data : []
  const keywordLower = keyword.toLowerCase()
  const size = Math.max(1, Math.min(params.size ?? 10, dataset.length || 10))
  const filtered = dataset.filter((item) => matchesKeyword(item, keywordLower))
  const shouldUseFiltered = keywordLower.length > 0 && filtered.length >= size
  const effectiveData = shouldUseFiltered ? filtered : dataset

  const total = effectiveData.length
  const totalPage = Math.max(1, Math.ceil(Math.max(total, 1) / size))
  const requestedPage = Math.max(1, Math.min(params.page ?? 1, totalPage))
  const start = (requestedPage - 1) * size
  const pageData = effectiveData.slice(start, start + size)

  return {
    ...baseResponse,
    code: 0,
    msg: "使用本地模拟数据",
    data: pageData,
    data_number: pageData.length,
    total,
    total_page: totalPage,
    page: requestedPage,
    cut_words: keyword,
  }
}

function matchesKeyword(item: ApiResponse["data"][number], keywordLower: string) {
  if (!keywordLower) return true
  const haystack = [item.title, item.content, item.wx_name, item.classify]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
  return haystack.includes(keywordLower)
}

function buildClientResponse(
  apiResponse: ApiResponse,
  params: ArticleSearchParams,
  source: "mock" | "remote",
) {
  const articles = (apiResponse.data ?? []).map(mapDatumToArticle)

  return {
    data: {
      articles,
      total: apiResponse.total ?? articles.length,
      totalPage: apiResponse.total_page ?? 1,
      page: apiResponse.page ?? params.page ?? 1,
      rawCutWords: apiResponse.cut_words ?? "",
    },
    meta: {
      source,
    },
  }
}

function isSuccessCode(code?: number) {
  return code === 0 || code === 200
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

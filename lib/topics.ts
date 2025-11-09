import { initDatabase, runQuery, runStatement, sqlValue } from "./sqlite"

export interface TopicReportPayload {
  articles: unknown[]
  topLiked: unknown[]
  topEngagement: unknown[]
  keywordCloud: unknown[]
  insights: unknown[]
}

export interface SaveTopicHistoryPayload {
  keyword: string
  dataSource: "mock" | "remote"
  total?: number
  totalPage?: number
  page?: number
  rawCutWords?: string
  articles: unknown[]
  topLiked: unknown[]
  topEngagement: unknown[]
  keywordCloud: unknown[]
  insights: unknown[]
}

export interface TopicHistoryRecord {
  id: number
  keyword: string
  dataSource: "mock" | "remote"
  articleCount: number
  total?: number
  totalPage?: number
  page?: number
  rawCutWords?: string
  createdAt: string
  report: TopicReportPayload
}

const HISTORY_LIMIT = 30

export function saveTopicHistory(payload: SaveTopicHistoryPayload) {
  if (!payload.keyword) {
    throw new Error("keyword is required")
  }

  initDatabase()

  const reportJson = JSON.stringify({
    articles: payload.articles ?? [],
    topLiked: payload.topLiked ?? [],
    topEngagement: payload.topEngagement ?? [],
    keywordCloud: payload.keywordCloud ?? [],
    insights: payload.insights ?? [],
  })

  const sql = `
    INSERT INTO topics (
      keyword,
      data_source,
      article_count,
      total,
      total_page,
      page,
      raw_cut_words,
      report_json
    ) VALUES (
      ${sqlValue(payload.keyword)},
      ${sqlValue(payload.dataSource)},
      ${sqlValue(payload.articles?.length ?? 0)},
      ${sqlValue(payload.total ?? null)},
      ${sqlValue(payload.totalPage ?? null)},
      ${sqlValue(payload.page ?? null)},
      ${sqlValue(payload.rawCutWords ?? null)},
      ${sqlValue(reportJson)}
    );
    SELECT last_insert_rowid() AS id;
  `

  const result = runQuery<{ id: number }>(sql)
  return result[0]?.id
}

export function listTopicHistory(limit = HISTORY_LIMIT): TopicHistoryRecord[] {
  initDatabase()
  const sql = `
    SELECT
      id,
      keyword,
      data_source,
      article_count,
      total,
      total_page,
      page,
      raw_cut_words,
      report_json,
      created_at
    FROM topics
    ORDER BY datetime(created_at) DESC
    LIMIT ${limit};
  `

  const rows = runQuery<{
    id: number
    keyword: string
    data_source: "mock" | "remote"
    article_count: number
    total?: number
    total_page?: number
    page?: number
    raw_cut_words?: string
    report_json: string
    created_at: string
  }>(sql)

  return rows.map((row) => ({
    id: row.id,
    keyword: row.keyword,
    dataSource: row.data_source,
    articleCount: row.article_count,
    total: row.total,
    totalPage: row.total_page,
    page: row.page,
    rawCutWords: row.raw_cut_words ?? undefined,
    createdAt: row.created_at,
    report: parseReport(row.report_json),
  }))
}

export function deleteTopicHistory(id: number) {
  initDatabase()
  runStatement(`DELETE FROM topics WHERE id = ${sqlValue(id)};`)
}

function parseReport(json: string): TopicReportPayload {
  try {
    const parsed = JSON.parse(json)
    return {
      articles: parsed.articles ?? [],
      topLiked: parsed.topLiked ?? [],
      topEngagement: parsed.topEngagement ?? [],
      keywordCloud: parsed.keywordCloud ?? [],
      insights: parsed.insights ?? [],
    }
  } catch {
    return {
      articles: [],
      topLiked: [],
      topEngagement: [],
      keywordCloud: [],
      insights: [],
    }
  }
}

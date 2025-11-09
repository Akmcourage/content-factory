export interface ArticleSearchParams {
  keyword: string
  period?: number
  page?: number
  size?: number
  sortType?: number
  mode?: number
  type?: number
  anyKeyword?: string
  excludeKeyword?: string
}

export interface KwSearchPayload {
  kw: string
  sort_type: number
  mode: number
  period: number
  page: number
  size: number
  key: string
  any_kw: string
  ex_kw: string
  verifycode: string
  type: number
}

export interface ApiResponse {
  code: number
  cost_money: number
  cut_words: string
  data: Datum[]
  data_number: number
  msg: string
  page: number
  remain_money: number
  total: number
  total_page: number
  [property: string]: unknown
}

export interface Datum {
  avatar: string
  classify: string
  content: string
  ghid: string
  ip_wording: string
  is_original: number
  looking: number
  praise: number
  publish_time: number
  publish_time_str: string
  read: number
  short_link: string
  title: string
  update_time: number
  update_time_str: string
  url: string
  wx_id: string
  wx_name: string
  [property: string]: unknown
}

export interface NormalizedArticle {
  id: string
  title: string
  coverUrl: string
  readCount: number
  likeCount: number
  watchCount: number
  publishTimestamp: number
  publishTimeText: string
  isOriginal: boolean
  url: string
  shortLink: string
  classify: string
  wxName: string
  wxId: string
  content: string
}

export interface ArticleSearchResult {
  articles: NormalizedArticle[]
  total: number
  totalPage: number
  page: number
  rawCutWords: string
}

export const API_ENDPOINT = "https://www.dajiala.com/fbmain/monitor/v3/kw_search"

export function buildPayload(params: ArticleSearchParams, apiKey: string): KwSearchPayload {
  return {
    kw: params.keyword,
    sort_type: params.sortType ?? 1,
    mode: params.mode ?? 1,
    period: params.period ?? 7,
    page: params.page ?? 1,
    size: params.size ?? 10,
    key: apiKey,
    any_kw: params.anyKeyword ?? "",
    ex_kw: params.excludeKeyword ?? "",
    verifycode: "",
    type: params.type ?? 1,
  }
}

export function mapDatumToArticle(datum: Datum): NormalizedArticle {
  const publishTimestamp =
    typeof datum.publish_time === "number" && datum.publish_time > 0
      ? datum.publish_time * 1000
      : Date.parse(datum.publish_time_str ?? "")

  return {
    id: datum.ghid || datum.wx_id || datum.url,
    title: datum.title,
    coverUrl: datum.avatar,
    readCount: datum.read ?? 0,
    likeCount: datum.praise ?? 0,
    watchCount: datum.looking ?? 0,
    publishTimestamp: Number.isFinite(publishTimestamp) ? publishTimestamp : Date.now(),
    publishTimeText: datum.publish_time_str || "",
    isOriginal: datum.is_original === 1,
    url: datum.url,
    shortLink: datum.short_link,
    classify: datum.classify,
    wxName: datum.wx_name,
    wxId: datum.wx_id,
    content: datum.content,
  }
}

"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  TrendingUp,
  Heart,
  Eye,
  Sparkles,
  Download,
  ArrowRight,
  AlertTriangle,
  Trash2,
} from "lucide-react"

import type { NormalizedArticle } from "@/lib/analysis"
import { cn } from "@/lib/utils"

interface ArticleApiResponse {
  data: {
    articles: NormalizedArticle[]
    total: number
    totalPage: number
    page: number
    rawCutWords: string
  }
  meta?: {
    source?: "mock" | "remote"
  }
}

interface KeywordEntry {
  word: string
  count: number
}

interface Insight {
  id: number
  title: string
  description: string
}

interface TopicHistoryReport {
  articles: NormalizedArticle[]
  topLiked: NormalizedArticle[]
  topEngagement: (NormalizedArticle & { engagementRate?: number })[]
  keywordCloud: KeywordEntry[]
  insights: Insight[]
}

interface TopicHistoryItem {
  id: number
  keyword: string
  dataSource: "mock" | "remote"
  articleCount: number
  total?: number
  totalPage?: number
  page?: number
  rawCutWords?: string
  createdAt: string
  report: TopicHistoryReport
}

export default function AnalysisPage() {
  const [keyword, setKeyword] = useState("")
  const [activeKeyword, setActiveKeyword] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showInsight, setShowInsight] = useState(false)
  const [articles, setArticles] = useState<NormalizedArticle[]>([])
  const [rawCutWords, setRawCutWords] = useState("")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [meta, setMeta] = useState({ total: 0, totalPage: 0, page: 1 })
  const [dataSource, setDataSource] = useState<"mock" | "remote">("mock")
  const [sourcePreference, setSourcePreference] = useState<"mock" | "remote">("mock")
  const [autoSaveHistory, setAutoSaveHistory] = useState(true)
  const [historyItems, setHistoryItems] = useState<TopicHistoryItem[]>([])
  const [historyLoading, setHistoryLoading] = useState(true)
  const [historyError, setHistoryError] = useState<string | null>(null)
  const [isSavingHistory, setIsSavingHistory] = useState(false)
  const [lastSavedSignature, setLastSavedSignature] = useState<string | null>(null)
  const [isPlaybackMode, setIsPlaybackMode] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [deletingHistoryId, setDeletingHistoryId] = useState<number | null>(null)
  const insightRef = useRef<HTMLDivElement | null>(null)

  const resolvedKeyword = keyword.trim()
  const hasKeyword = resolvedKeyword.length > 0

  const handleSearch = async () => {
    if (!hasKeyword || isSearching) return

    setIsPlaybackMode(false)
    setLastSavedSignature(null)
    setIsSearching(true)
    setErrorMessage(null)
    setShowInsight(false)

    try {
      const normalizedKeyword = resolvedKeyword
      const payload = {
        kw: normalizedKeyword,
        sort_type: 1,
        mode: 1,
        period: 7,
        page: 1,
        size: 20,
        key: "123308c85923b12f9e0",
        any_kw: "",
        ex_kw: "",
        verifycode: "",
        type: 1,
        source: sourcePreference,
      }

      const response = await fetch("/api/analysis/articles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const result = (await response.json()) as ArticleApiResponse & { message?: string }

      if (!response.ok) {
        throw new Error(result?.message ?? "第三方接口调用失败")
      }

      setArticles(result.data.articles ?? [])
      setRawCutWords(result.data.rawCutWords ?? "")
      setMeta({
        total: result.data.total ?? 0,
        totalPage: result.data.totalPage ?? 1,
        page: result.data.page ?? 1,
      })
      setDataSource(result.meta?.source === "mock" ? "mock" : "remote")
      setActiveKeyword(payload.kw)
      setShowResults(true)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "搜索失败，请稍后重试")
      setShowResults(false)
    } finally {
      setIsSearching(false)
    }
  }

  const handleGenerateInsight = () => {
    if (!articles.length) return
    setIsGenerating(true)
    setTimeout(() => {
      setIsGenerating(false)
      setShowInsight(true)
    }, 800)
  }

  const topLikedArticles = useMemo(() => getTopLikedArticles(articles), [articles])
  const topEngagementArticles = useMemo(() => getTopEngagementArticles(articles), [articles])
  const keywordCloud = useMemo(
    () => buildKeywordCloud(articles, rawCutWords, activeKeyword),
    [articles, rawCutWords, activeKeyword],
  )
  const insights = useMemo(
    () => buildInsights(articles, keywordCloud, activeKeyword),
    [articles, keywordCloud, activeKeyword],
  )

  async function fetchHistoryItems() {
    try {
      setHistoryLoading(true)
      setHistoryError(null)
      const response = await fetch("/api/analysis/history")
      const result = await response.json()
      if (!response.ok) {
        throw new Error(result?.message ?? "获取历史记录失败")
      }
      const items = Array.isArray(result?.data) ? parseHistoryItems(result.data) : []
      setHistoryItems(items)
    } catch (error) {
      setHistoryError(error instanceof Error ? error.message : "获取历史记录失败")
    } finally {
      setHistoryLoading(false)
    }
  }

  function buildReportSnapshot() {
    return {
      keyword: activeKeyword,
      dataSource,
      total: meta.total,
      totalPage: meta.totalPage,
      page: meta.page,
      rawCutWords,
      articles,
      topLiked: topLikedArticles,
      topEngagement: topEngagementArticles.map((article) => ({
        ...article,
        engagementRate: Number(calculateEngagementRate(article).toFixed(2)),
      })),
      keywordCloud,
      insights,
    }
  }

  function buildHistorySignature() {
    if (!activeKeyword || !articles.length) {
      return null
    }
    return JSON.stringify({
      keyword: activeKeyword,
      source: dataSource,
      total: meta.total,
      page: meta.page,
      articleCount: articles.length,
      firstArticle: articles[0]?.id ?? "",
      firstInsight: insights[0]?.title ?? "",
    })
  }

  async function persistHistory(signature: string) {
    try {
      setIsSavingHistory(true)
      const snapshot = buildReportSnapshot()
      const response = await fetch("/api/analysis/history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(snapshot),
      })
      const result = await response.json()
      if (!response.ok) {
        throw new Error(result?.message ?? "保存历史记录失败")
      }
      if (Array.isArray(result?.history)) {
        setHistoryItems(parseHistoryItems(result.history))
      } else {
        void fetchHistoryItems()
      }
      setLastSavedSignature(signature)
    } catch (error) {
      setHistoryError(error instanceof Error ? error.message : "保存历史记录失败")
    } finally {
      setIsSavingHistory(false)
    }
  }

  function handleLoadHistory(item: TopicHistoryItem) {
    setIsPlaybackMode(true)
    setKeyword(item.keyword)
    setActiveKeyword(item.keyword)
    setDataSource(item.dataSource)
    setSourcePreference(item.dataSource)
    setRawCutWords(item.rawCutWords ?? "")
    setMeta({
      total: item.total ?? item.articleCount,
      totalPage: item.totalPage ?? 1,
      page: item.page ?? 1,
    })
    setArticles(item.report.articles ?? [])
    setShowResults(true)
    setShowInsight(true)
    setErrorMessage(null)
  }

  async function handleDeleteHistory(id: number) {
    if (deletingHistoryId !== null) return
    const target = historyItems.find((item) => item.id === id)
    const confirmed = window.confirm("确定删除该历史记录吗？")
    if (!confirmed) return
    try {
      setDeletingHistoryId(id)
      const response = await fetch(`/api/analysis/history?id=${id}`, {
        method: "DELETE",
      })
      const result = await response.json()
      if (!response.ok) {
        throw new Error(result?.message ?? "删除历史记录失败")
      }
      if (Array.isArray(result?.history)) {
        setHistoryItems(parseHistoryItems(result.history))
      } else {
        setHistoryItems((prev) => prev.filter((item) => item.id !== id))
      }
      if (isPlaybackMode && target && activeKeyword === target.keyword) {
        setIsPlaybackMode(false)
      }
      setLastSavedSignature(null)
    } catch (error) {
      setHistoryError(error instanceof Error ? error.message : "删除历史记录失败")
    } finally {
      setDeletingHistoryId(null)
    }
  }

  useEffect(() => {
    void fetchHistoryItems()
  }, [])

  useEffect(() => {
    if (!showInsight || !autoSaveHistory || !articles.length || isPlaybackMode) {
      return
    }
    const signature = buildHistorySignature()
    if (!signature || signature === lastSavedSignature || isSavingHistory) {
      return
    }
    void persistHistory(signature)
  }, [
    showInsight,
    autoSaveHistory,
    articles,
    keywordCloud,
    insights,
    topLikedArticles,
    topEngagementArticles,
    meta.total,
    meta.totalPage,
    meta.page,
    rawCutWords,
    activeKeyword,
    dataSource,
    lastSavedSignature,
    isSavingHistory,
    isPlaybackMode,
  ])

  useEffect(() => {
    if (showInsight && insightRef.current) {
      insightRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }, [showInsight])

  const handleExportReport = () => {
    if (!showInsight || !articles.length) return

    setIsExporting(true)
    try {
      const snapshot = buildReportSnapshot()
      const payload = {
        keyword: snapshot.keyword,
        generatedAt: new Date().toISOString(),
        source: snapshot.dataSource,
        totals: {
          total: snapshot.total,
          totalPage: snapshot.totalPage,
          currentPage: snapshot.page,
          articleCount: snapshot.articles.length,
        },
        rawCutWords: snapshot.rawCutWords,
        articles: snapshot.articles,
        topLiked: snapshot.topLiked,
        topEngagement: snapshot.topEngagement,
        keywordCloud: snapshot.keywordCloud,
        insights: snapshot.insights,
      }

      const fileName = `insight-report-${snapshot.keyword || "report"}-${Date.now()}.json`
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)

      const anchor = document.createElement("a")
      anchor.href = url
      anchor.download = fileName
      anchor.click()
      URL.revokeObjectURL(url)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">🔍 选题分析</h1>
        <p className="text-muted-foreground mt-2">
          通过关键词搜索公众号文章，自动生成点赞榜、互动榜、高频词云与选题洞察
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>关键词搜索</CardTitle>
          <CardDescription>输入关键词，系统将调用第三方接口抓取公众号文章</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
                <div className="flex-1 space-y-2">
                  <label className="text-sm font-medium">关键词</label>
                  <Input
                    placeholder="请输入关键词，例如：人民日报、人工智能..."
                    value={keyword}
                    onChange={(event) => setKeyword(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault()
                        handleSearch()
                      }
                    }}
                  />
                </div>

                <div className="space-y-2 lg:w-48">
                  <label className="text-sm font-medium">数据来源</label>
                  <select
                    value={sourcePreference}
                    onChange={(event) => setSourcePreference(event.target.value as "mock" | "remote")}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="mock">模拟数据 (推荐)</option>
                    <option value="remote">实时接口</option>
                  </select>
                </div>

                <div className="space-y-2 lg:w-48">
                  <label className="text-sm font-medium">开始分析</label>
                  <Button onClick={handleSearch} disabled={isSearching || !hasKeyword} className="w-full">
                    {isSearching ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        搜索中...
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4 mr-2" />
                        开始分析
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                当前关键词：{hasKeyword ? `「${resolvedKeyword}」` : "请输入关键词后再分析"}
              </p>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={autoSaveHistory}
                    onChange={(event) => setAutoSaveHistory(event.target.checked)}
                  />
                  自动保存到历史
                </label>
                <div className="text-xs text-muted-foreground flex items-center gap-2">
                  {isSavingHistory && showInsight && autoSaveHistory && !isPlaybackMode && <span>保存中...</span>}
                </div>
              </div>
            </div>
            {errorMessage && (
              <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                <AlertTriangle className="h-4 w-4 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>历史关键词</CardTitle>
          <CardDescription>最近保存的选题及洞察记录</CardDescription>
        </CardHeader>
        <CardContent>
          {historyLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-14 rounded-md bg-muted animate-pulse" />
              ))}
            </div>
          ) : historyError ? (
            <p className="text-sm text-destructive">{historyError}</p>
          ) : historyItems.length === 0 ? (
            <p className="text-sm text-muted-foreground">暂无历史记录，生成洞察后会自动保存。</p>
          ) : (
            <div className="divide-y">
              {historyItems.map((item) => (
                <div key={item.id} className="py-3 flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">{item.keyword}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatHistoryDate(item.createdAt)} · {item.articleCount} 篇 ·{" "}
                        {item.dataSource === "remote" ? "实时接口" : "模拟数据"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleLoadHistory(item)}>
                        回放选题
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteHistory(item.id)}
                        disabled={deletingHistoryId === item.id}
                        title="删除记录"
                      >
                        <Trash2 className="h-4 w-4" />
                        {deletingHistoryId === item.id ? "删除中..." : "删除"}
                      </Button>
                    </div>
                  </div>
                  {item.report.insights[0] && (
                    <p className="text-sm text-muted-foreground">
                      洞察：{item.report.insights[0].title}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {showResults && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <CardTitle>搜索结果</CardTitle>
                  {dataSource === "mock" && (
                    <Badge variant="secondary" className="text-xs font-normal">
                      模拟数据
                    </Badge>
                  )}
                </div>
                <CardDescription>
                  {activeKeyword ? (
                    <>
                      关键词「{activeKeyword}」共返回 {meta.total.toLocaleString()} 篇文章，当前第 {meta.page} /
                      {meta.totalPage} 页
                    </>
                  ) : (
                    "暂无关键词上下文"
                  )}
                </CardDescription>
              </div>
              <Button onClick={handleGenerateInsight} disabled={isGenerating || !articles.length}>
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    生成中...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    生成洞察报告
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {articles.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-12 text-center text-muted-foreground">
                <p>未获取到相关公众号文章，尝试更换关键词或放宽时间范围。</p>
              </div>
            ) : (
              <div className="space-y-4">
                {articles.map((article) => (
                  <div
                    key={article.id}
                    className="flex gap-4 p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                  >
                    <div className="w-32 h-20 bg-muted rounded-md flex-shrink-0 overflow-hidden">
                      {article.coverUrl ? (
                        // 图片域名较多，使用原生 img 保持兼容
                        <img
                          src={article.coverUrl}
                          alt={article.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                          无封面
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-medium line-clamp-2">{article.title}</h3>
                          <div className="text-sm text-muted-foreground mt-1 flex flex-wrap gap-3">
                            <span>{article.wxName}</span>
                            {article.classify && <span>分类：{article.classify}</span>}
                            <span>{formatPublishTime(article)}</span>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={cn(
                            "flex-shrink-0 border",
                            article.isOriginal
                              ? "border-blue-200 bg-blue-50 text-blue-700"
                              : "border-transparent bg-muted text-muted-foreground",
                          )}
                        >
                          {article.isOriginal ? "原创" : "非原创"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {article.readCount.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="h-4 w-4" />
                          {article.likeCount.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4" />
                          {article.watchCount.toLocaleString()}
                        </span>
                        <span className="ml-auto">
                          互动率: {calculateEngagementRate(article).toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {showInsight && (
        <div className="space-y-6" ref={insightRef}>
          <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Sparkles className="h-6 w-6 text-yellow-500" />
                    洞察报告
                  </CardTitle>
                  <CardDescription className="mt-2">
                    基于 {articles.length} 篇文章的实时统计分析
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportReport}
                    disabled={!showInsight || !articles.length || isExporting}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {isExporting ? "导出中..." : "导出报告"}
                  </Button>
                  <Button size="sm">
                    <ArrowRight className="h-4 w-4 mr-2" />
                    创作文章
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                点赞量 TOP 5
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topLikedArticles.length === 0 ? (
                <p className="text-sm text-muted-foreground">暂无点赞数据</p>
              ) : (
                <div className="space-y-3">
                  {topLikedArticles.map((article, index) => (
                    <div key={`${article.id}-${index}`} className="flex items-center gap-3">
                      <div
                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          index === 0
                            ? "bg-yellow-100 text-yellow-700"
                            : index === 1
                              ? "bg-gray-100 text-gray-700"
                              : index === 2
                                ? "bg-orange-100 text-orange-700"
                                : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{article.title}</p>
                        <p className="text-sm text-muted-foreground">
                          点赞: {article.likeCount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                互动率 TOP 5
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topEngagementArticles.length === 0 ? (
                <p className="text-sm text-muted-foreground">暂无互动率数据</p>
              ) : (
                <div className="space-y-3">
                  {topEngagementArticles.map((article, index) => (
                    <div key={`${article.id}-${index}`} className="flex items-center gap-3">
                      <div
                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          index === 0
                            ? "bg-yellow-100 text-yellow-700"
                            : index === 1
                              ? "bg-gray-100 text-gray-700"
                              : index === 2
                                ? "bg-orange-100 text-orange-700"
                                : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{article.title}</p>
                        <p className="text-sm text-muted-foreground">
                          互动率: {calculateEngagementRate(article).toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">☁️ 高频词云</CardTitle>
              <CardDescription>分析文章标题、正文与第三方分词结果得到的高频词</CardDescription>
            </CardHeader>
            <CardContent>
              {keywordCloud.length === 0 ? (
                <p className="text-sm text-muted-foreground">暂无可展示的关键词</p>
              ) : (
                <div className="flex flex-wrap gap-3 p-4 bg-muted/30 rounded-lg">
                  {keywordCloud.map((keywordEntry) => (
                    <Badge
                      key={keywordEntry.word}
                      variant="secondary"
                      className="text-base px-4 py-2"
                      style={{
                        fontSize: `${Math.min(1 + keywordEntry.count / 12, 2)}rem`,
                      }}
                    >
                      {keywordEntry.word}
                      <span className="ml-2 text-xs opacity-70">×{keywordEntry.count}</span>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">💡 选题洞察</CardTitle>
              <CardDescription>基于实时数据自动生成的5个核心洞察</CardDescription>
            </CardHeader>
            <CardContent>
              {insights.length === 0 ? (
                <p className="text-sm text-muted-foreground">暂无洞察，请先生成分析数据</p>
              ) : (
                <div className="space-y-4">
                  {insights.map((insight, index) => (
                    <div key={insight.id} className="p-4 rounded-lg border bg-card">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold mb-2">{insight.title}</h4>
                          <p className="text-sm text-muted-foreground leading-relaxed">{insight.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

function calculateEngagementRate(article: NormalizedArticle) {
  const denominator = Math.max(article.readCount, 1)
  return ((article.likeCount + article.watchCount) / denominator) * 100
}

function formatPublishTime(article: NormalizedArticle) {
  if (article.publishTimeText) {
    return article.publishTimeText
  }

  try {
    return new Date(article.publishTimestamp).toLocaleString("zh-CN", {
      hour12: false,
    })
  } catch {
    return "未知时间"
  }
}

function getTopLikedArticles(articles: NormalizedArticle[]) {
  return [...articles]
    .filter((article) => article.likeCount > 0)
    .sort((a, b) => b.likeCount - a.likeCount)
    .slice(0, 5)
}

function getTopEngagementArticles(articles: NormalizedArticle[]) {
  return [...articles]
    .filter((article) => article.readCount > 0)
    .sort((a, b) => calculateEngagementRate(b) - calculateEngagementRate(a))
    .slice(0, 5)
}

function buildKeywordCloud(
  articles: NormalizedArticle[],
  rawCutWords: string,
  activeKeyword: string,
): KeywordEntry[] {
  const frequency = new Map<string, number>()

  const collect = (text: string) => {
    splitWords(text).forEach((word) => {
      const nextCount = (frequency.get(word) ?? 0) + 1
      frequency.set(word, nextCount)
    })
  }

  if (rawCutWords) {
    collect(rawCutWords)
  }

  articles.forEach((article) => {
    collect(article.title)
    collect(article.content)
    collect(article.classify ?? "")
  })

  if (activeKeyword) {
    collect(activeKeyword)
  }

  return [...frequency.entries()]
    .filter(([, count]) => count > 1)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([word, count]) => ({ word, count }))
}

function splitWords(text: string) {
  return text
    .split(/[\s,，。、“”‘’"'；;·、|/\\\-]+/)
    .map((word) => word.trim())
    .filter(isMeaningfulKeyword)
}

function isMeaningfulKeyword(word: string) {
  if (word.length < 2) {
    return false
  }
  // 纯数字或纯字母缺乏分析意义，直接过滤
  if (/^[0-9]+$/.test(word)) {
    return false
  }
  if (/^[a-zA-Z]+$/.test(word)) {
    return false
  }
  // 没有中文或其他 CJK 字符时，多半为无意义编号
  if (!/[\u4e00-\u9fff]/.test(word)) {
    return false
  }
  return true
}

function buildInsights(
  articles: NormalizedArticle[],
  keywords: KeywordEntry[],
  activeKeyword: string,
): Insight[] {
  if (!articles.length) {
    return []
  }

  const insights: Insight[] = []
  const topRead = [...articles].sort((a, b) => b.readCount - a.readCount)[0]
  if (topRead) {
    insights.push({
      id: 1,
      title: `头部阅读：《${topRead.title}》`,
      description: `该文章阅读量达到 ${topRead.readCount.toLocaleString()}，显著高于平均水平，是潜在爆款题材。`,
    })
  }

  const topEngagement = [...articles].sort(
    (a, b) => calculateEngagementRate(b) - calculateEngagementRate(a),
  )[0]
  if (topEngagement) {
    insights.push({
      id: 2,
      title: "互动驱动内容",
      description: `互动率最高的《${topEngagement.title}》达到 ${calculateEngagementRate(topEngagement).toFixed(2)}%，说明读者更愿意参与此类话题。`,
    })
  }

  const originalArticles = articles.filter((article) => article.isOriginal)
  const originalRate = (originalArticles.length / Math.max(articles.length, 1)) * 100
  insights.push({
    id: 3,
    title: "原创内容竞争度",
    description: `原创文章占比 ${originalRate.toFixed(1)}%，从源头创作更容易建立差异化。`,
  })

  const wxRanking = new Map<string, number>()
  articles.forEach((article) => {
    const total = (wxRanking.get(article.wxName) ?? 0) + article.readCount
    wxRanking.set(article.wxName, total)
  })
  const accountEntries = [...wxRanking.entries()].filter(([name]) => name?.trim())
  const topAccount = accountEntries.sort((a, b) => b[1] - a[1])[0]
  if (topAccount) {
    insights.push({
      id: 4,
      title: `高势能账号：${topAccount[0]}`,
      description: `${topAccount[0]} 在本批次贡献了 ${topAccount[1].toLocaleString()} 阅读，值得持续跟踪其发文结构与标题策略。`,
    })
  }

  const keywordFocus = keywords[0]
  insights.push({
    id: 5,
    title: "词频热点",
    description: keywordFocus
      ? `「${keywordFocus.word}」出现频次最高（${keywordFocus.count} 次），可围绕该主题延伸更细分的选题。`
      : `当前关键词「${activeKeyword || "该领域"}」下主题分散，建议结合痛点重新聚焦。`,
  })

  return insights.slice(0, 5)
}

function parseHistoryItems(raw: unknown[]): TopicHistoryItem[] {
  if (!Array.isArray(raw)) {
    return []
  }

  return raw
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null
      }
      const record = item as Record<string, any>
      const keyword =
        typeof record.keyword === "string"
          ? record.keyword
          : typeof record.kw === "string"
            ? record.kw
            : ""
      if (!keyword) {
        return null
      }
      const dataSource =
        record.dataSource === "remote" || record.data_source === "remote" ? "remote" : "mock"
      return {
        id: Number(record.id ?? Date.now()),
        keyword,
        dataSource,
        articleCount: Number(record.articleCount ?? record.article_count ?? 0),
        total: pickNumber(record.total),
        totalPage: pickNumber(record.totalPage ?? record.total_page),
        page: pickNumber(record.page),
        rawCutWords:
          typeof record.rawCutWords === "string"
            ? record.rawCutWords
            : typeof record.raw_cut_words === "string"
              ? record.raw_cut_words
              : undefined,
        createdAt:
          typeof record.createdAt === "string"
            ? record.createdAt
            : typeof record.created_at === "string"
              ? record.created_at
              : "",
        report: normalizeHistoryReport(record.report ?? record.report_json),
      } satisfies TopicHistoryItem
    })
    .filter((item): item is TopicHistoryItem => Boolean(item))
}

function normalizeHistoryReport(report: unknown): TopicHistoryReport {
  if (typeof report === "string") {
    try {
      return normalizeHistoryReport(JSON.parse(report))
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

  if (!report || typeof report !== "object") {
    return {
      articles: [],
      topLiked: [],
      topEngagement: [],
      keywordCloud: [],
      insights: [],
    }
  }

  const payload = report as Record<string, unknown>
  const toArray = <T>(value: unknown) => (Array.isArray(value) ? (value as T[]) : [])

  return {
    articles: toArray<NormalizedArticle>(payload.articles),
    topLiked: toArray<NormalizedArticle>(payload.topLiked),
    topEngagement: toArray<(NormalizedArticle & { engagementRate?: number })>(payload.topEngagement),
    keywordCloud: toArray<KeywordEntry>(payload.keywordCloud),
    insights: toArray<Insight>(payload.insights),
  }
}

function formatHistoryDate(value?: string) {
  if (!value) return ""
  try {
    return new Date(value).toLocaleString("zh-CN", { hour12: false })
  } catch {
    return value
  }
}

function pickNumber(value: unknown) {
  return typeof value === "number" ? value : undefined
}

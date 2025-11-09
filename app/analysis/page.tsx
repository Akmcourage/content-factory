"use client"

import { useMemo, useState } from "react"
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
} from "lucide-react"

import type { NormalizedArticle } from "@/lib/analysis"

interface ArticleApiResponse {
  data: {
    articles: NormalizedArticle[]
    total: number
    totalPage: number
    page: number
    rawCutWords: string
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

  const hasKeyword = keyword.trim().length > 0

  const handleSearch = async () => {
    if (!hasKeyword || isSearching) return

    setIsSearching(true)
    setErrorMessage(null)
    setShowInsight(false)

    try {
      const normalizedKeyword = keyword.trim()
      const payload = {
        kw: normalizedKeyword,
        sort_type: 1,
        mode: 1,
        period: 7,
        page: 1,
        size: 1,
        key: "123308c85923b12f9e0",
        any_kw: "",
        ex_kw: "",
        verifycode: "",
        type: 1,
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
            <div className="flex gap-4">
              <Input
                placeholder="请输入关键词，例如：人工智能、ChatGPT..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleSearch()
                  }
                }}
                className="flex-1"
              />
              <Button onClick={handleSearch} disabled={isSearching || !hasKeyword}>
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
            {errorMessage && (
              <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                <AlertTriangle className="h-4 w-4 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {showResults && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <CardTitle>搜索结果</CardTitle>
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
                        {article.isOriginal && (
                          <Badge variant="outline" className="flex-shrink-0">
                            原创
                          </Badge>
                        )}
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
        <div className="space-y-6">
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
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    导出报告
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
    .filter((word) => word.length >= 2)
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

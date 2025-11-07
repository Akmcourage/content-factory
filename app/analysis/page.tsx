"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, TrendingUp, Heart, Eye, Sparkles, Download, ArrowRight } from "lucide-react"

export default function AnalysisPage() {
  const [keyword, setKeyword] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showInsight, setShowInsight] = useState(false)

  // 模拟搜索文章
  const handleSearch = () => {
    setIsSearching(true)
    setTimeout(() => {
      setIsSearching(false)
      setShowResults(true)
    }, 1500)
  }

  // 模拟生成洞察报告
  const handleGenerateInsight = () => {
    setIsGenerating(true)
    setTimeout(() => {
      setIsGenerating(false)
      setShowInsight(true)
    }, 2000)
  }

  // 模拟文章数据
  const mockArticles = [
    {
      id: 1,
      title: "AI时代，如何用ChatGPT提升工作效率10倍",
      coverUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=300&h=200&fit=crop",
      readCount: 12500,
      likeCount: 892,
      watchCount: 456,
      publishTime: "2024-01-15",
      isOriginal: true,
    },
    {
      id: 2,
      title: "从零开始学习人工智能：新手必看指南",
      coverUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=300&h=200&fit=crop",
      readCount: 9800,
      likeCount: 745,
      watchCount: 389,
      publishTime: "2024-01-14",
      isOriginal: true,
    },
    {
      id: 3,
      title: "2024年AI工具推荐：这10个工具让你效率翻倍",
      coverUrl: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=300&h=200&fit=crop",
      readCount: 15200,
      likeCount: 1120,
      watchCount: 678,
      publishTime: "2024-01-13",
      isOriginal: false,
    },
    {
      id: 4,
      title: "ChatGPT高级玩法：让AI成为你的私人助理",
      coverUrl: "https://images.unsplash.com/photo-1676277791608-ac379a7a39df?w=300&h=200&fit=crop",
      readCount: 8900,
      likeCount: 567,
      watchCount: 234,
      publishTime: "2024-01-12",
      isOriginal: true,
    },
    {
      id: 5,
      title: "人工智能如何改变内容创作行业",
      coverUrl: "https://images.unsplash.com/photo-1655635643519-e45815e6b388?w=300&h=200&fit=crop",
      readCount: 11200,
      likeCount: 823,
      watchCount: 445,
      publishTime: "2024-01-11",
      isOriginal: true,
    },
  ]

  // 计算互动率
  const calculateEngagementRate = (article: typeof mockArticles[0]) => {
    return (((article.likeCount + article.watchCount) / article.readCount) * 100).toFixed(2)
  }

  // 点赞量TOP 5
  const topLikedArticles = [...mockArticles].sort((a, b) => b.likeCount - a.likeCount).slice(0, 5)

  // 互动率TOP 5
  const topEngagementArticles = [...mockArticles]
    .sort((a, b) => parseFloat(calculateEngagementRate(b)) - parseFloat(calculateEngagementRate(a)))
    .slice(0, 5)

  // 高频词
  const topKeywords = [
    { word: "AI", count: 45 },
    { word: "ChatGPT", count: 38 },
    { word: "效率", count: 32 },
    { word: "工具", count: 28 },
    { word: "学习", count: 25 },
    { word: "提升", count: 22 },
    { word: "内容创作", count: 20 },
    { word: "自动化", count: 18 },
  ]

  // 选题洞察
  const insights = [
    {
      id: 1,
      title: "实用工具类内容最受欢迎",
      description: "带有具体工具推荐和使用方法的文章获得了最高的互动率，读者更倾向于可以直接应用的内容。",
    },
    {
      id: 2,
      title: "新手入门指南有巨大需求",
      description: "\"从零开始\"、\"新手必看\"等关键词的文章阅读量持续走高，说明AI领域仍有大量新用户涌入。",
    },
    {
      id: 3,
      title: "效率提升是核心痛点",
      description: "与\"提升效率\"、\"节省时间\"相关的内容点赞率高出平均水平30%，这是用户的核心需求。",
    },
    {
      id: 4,
      title: "数字化标题吸引眼球",
      description: "包含具体数字的标题（如\"10倍\"、\"10个工具\"）的点击率比普通标题高出约40%。",
    },
    {
      id: 5,
      title: "实战案例比理论更受欢迎",
      description: "包含实际应用场景和案例的文章互动率明显高于纯理论介绍，用户更关注实际应用价值。",
    },
  ]

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">🔍 选题分析</h1>
        <p className="text-muted-foreground mt-2">
          通过关键词搜索公众号文章，AI分析生成选题洞察
        </p>
      </div>

      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle>关键词搜索</CardTitle>
          <CardDescription>输入关键词搜索相关公众号文章</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="请输入关键词，例如：人工智能、ChatGPT..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={isSearching || !keyword}>
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
        </CardContent>
      </Card>

      {/* Search Results */}
      {showResults && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>搜索结果</CardTitle>
                <CardDescription>共找到 {mockArticles.length} 篇相关文章</CardDescription>
              </div>
              <Button onClick={handleGenerateInsight} disabled={isGenerating}>
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
            <div className="space-y-4">
              {mockArticles.map((article) => (
                <div
                  key={article.id}
                  className="flex gap-4 p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                >
                  {/* Cover Image */}
                  <div className="w-32 h-20 bg-muted rounded-md flex-shrink-0 overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-xs text-muted-foreground">
                      封面图
                    </div>
                  </div>

                  {/* Article Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-medium line-clamp-2">{article.title}</h3>
                      {article.isOriginal && (
                        <Badge variant="outline" className="flex-shrink-0">
                          原创
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {article.readCount.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        {article.likeCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" />
                        {article.watchCount}
                      </span>
                      <span>{article.publishTime}</span>
                      <span className="ml-auto">
                        互动率: {calculateEngagementRate(article)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Insight Report */}
      {showInsight && (
        <div className="space-y-6">
          {/* Report Header */}
          <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Sparkles className="h-6 w-6 text-yellow-500" />
                    洞察报告
                  </CardTitle>
                  <CardDescription className="mt-2">
                    基于 {mockArticles.length} 篇文章的AI分析结果
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

          {/* Top Liked Articles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                点赞量 TOP 5
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topLikedArticles.map((article, index) => (
                  <div key={article.id} className="flex items-center gap-3">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      index === 0 ? "bg-yellow-100 text-yellow-700" :
                      index === 1 ? "bg-gray-100 text-gray-700" :
                      index === 2 ? "bg-orange-100 text-orange-700" :
                      "bg-muted text-muted-foreground"
                    }`}>
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
            </CardContent>
          </Card>

          {/* Top Engagement Articles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                互动率 TOP 5
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topEngagementArticles.map((article, index) => (
                  <div key={article.id} className="flex items-center gap-3">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      index === 0 ? "bg-yellow-100 text-yellow-700" :
                      index === 1 ? "bg-gray-100 text-gray-700" :
                      index === 2 ? "bg-orange-100 text-orange-700" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{article.title}</p>
                      <p className="text-sm text-muted-foreground">
                        互动率: {calculateEngagementRate(article)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Keywords Cloud */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                ☁️ 高频词云
              </CardTitle>
              <CardDescription>分析文章标题和内容中的高频关键词</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3 p-4 bg-muted/30 rounded-lg">
                {topKeywords.map((keyword) => (
                  <Badge
                    key={keyword.word}
                    variant="secondary"
                    className="text-base px-4 py-2"
                    style={{
                      fontSize: `${Math.min(1 + keyword.count / 30, 1.8)}rem`,
                    }}
                  >
                    {keyword.word}
                    <span className="ml-2 text-xs opacity-70">×{keyword.count}</span>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Topic Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                💡 选题洞察
              </CardTitle>
              <CardDescription>基于数据分析的5个核心选题方向</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {insights.map((insight, index) => (
                  <div key={insight.id} className="p-4 rounded-lg border bg-card">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-2">{insight.title}</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {insight.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

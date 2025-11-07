"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Edit3, Eye, Send, Trash2, MoreVertical, Filter, CheckCircle2, Clock, XCircle, TrendingUp } from "lucide-react"

type ArticleStatus = "draft" | "published" | "failed"

interface Article {
  id: number
  title: string
  coverUrl: string
  content: string
  status: ArticleStatus
  createdAt: string
  publishedAt?: string
  wechatUrl?: string
  readCount?: number
  likeCount?: number
  errorMessage?: string
}

export default function PublishPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<ArticleStatus | "all">("all")
  const [selectedArticles, setSelectedArticles] = useState<number[]>([])

  // 模拟文章数据
  const mockArticles: Article[] = [
    {
      id: 1,
      title: "如何提高工作效率的10个技巧",
      coverUrl: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b",
      content: "文章内容...",
      status: "draft",
      createdAt: "2024-01-20 14:30",
    },
    {
      id: 2,
      title: "AI时代的内容创作指南",
      coverUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995",
      content: "文章内容...",
      status: "published",
      createdAt: "2024-01-19 10:15",
      publishedAt: "2024-01-19 15:00",
      wechatUrl: "https://mp.weixin.qq.com/s/xxx",
      readCount: 1250,
      likeCount: 89,
    },
    {
      id: 3,
      title: "提升个人品牌影响力的5个方法",
      coverUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978",
      content: "文章内容...",
      status: "draft",
      createdAt: "2024-01-18 16:45",
    },
    {
      id: 4,
      title: "2024年内容营销趋势分析",
      coverUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f",
      content: "文章内容...",
      status: "published",
      createdAt: "2024-01-17 09:20",
      publishedAt: "2024-01-17 14:30",
      wechatUrl: "https://mp.weixin.qq.com/s/yyy",
      readCount: 2340,
      likeCount: 156,
    },
    {
      id: 5,
      title: "从零开始学习AI绘画",
      coverUrl: "https://images.unsplash.com/photo-1547891654-e66ed7ebb968",
      content: "文章内容...",
      status: "failed",
      createdAt: "2024-01-16 13:15",
      errorMessage: "发布失败：Token已过期，请重新授权",
    },
    {
      id: 6,
      title: "ChatGPT高级玩法全攻略",
      coverUrl: "https://images.unsplash.com/photo-1676277791608-ac379a7a39df",
      content: "文章内容...",
      status: "published",
      createdAt: "2024-01-15 11:00",
      publishedAt: "2024-01-15 16:20",
      wechatUrl: "https://mp.weixin.qq.com/s/zzz",
      readCount: 3120,
      likeCount: 234,
    },
  ]

  // 状态统计
  const statusStats = {
    all: mockArticles.length,
    draft: mockArticles.filter(a => a.status === "draft").length,
    published: mockArticles.filter(a => a.status === "published").length,
    failed: mockArticles.filter(a => a.status === "failed").length,
  }

  // 筛选文章
  const filteredArticles = mockArticles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === "all" || article.status === filterStatus
    return matchesSearch && matchesStatus
  })

  // 获取状态配置
  const getStatusConfig = (status: ArticleStatus) => {
    const configs = {
      draft: {
        label: "草稿",
        variant: "secondary" as const,
        icon: Clock,
        color: "text-gray-600",
        bgColor: "bg-gray-100",
      },
      published: {
        label: "已发布",
        variant: "success" as const,
        icon: CheckCircle2,
        color: "text-green-600",
        bgColor: "bg-green-100",
      },
      failed: {
        label: "发布失败",
        variant: "destructive" as const,
        icon: XCircle,
        color: "text-red-600",
        bgColor: "bg-red-100",
      },
    }
    return configs[status]
  }

  // 切换文章选择
  const toggleArticle = (id: number) => {
    setSelectedArticles(prev =>
      prev.includes(id)
        ? prev.filter(articleId => articleId !== id)
        : [...prev, id]
    )
  }

  // 全选/取消全选
  const toggleSelectAll = () => {
    if (selectedArticles.length === filteredArticles.length) {
      setSelectedArticles([])
    } else {
      setSelectedArticles(filteredArticles.map(a => a.id))
    }
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">📝 发布管理</h1>
        <p className="text-muted-foreground mt-2">
          管理所有AI生成的文章，支持编辑、预览和发布到公众号
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilterStatus("all")}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">全部文章</p>
                <p className="text-2xl font-bold mt-2">{statusStats.all}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilterStatus("draft")}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">草稿</p>
                <p className="text-2xl font-bold mt-2">{statusStats.draft}</p>
              </div>
              <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilterStatus("published")}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">已发布</p>
                <p className="text-2xl font-bold mt-2">{statusStats.published}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilterStatus("failed")}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">发布失败</p>
                <p className="text-2xl font-bold mt-2">{statusStats.failed}</p>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索文章标题..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as ArticleStatus | "all")}
                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="all">全部状态</option>
                <option value="draft">草稿</option>
                <option value="published">已发布</option>
                <option value="failed">发布失败</option>
              </select>
            </div>
          </div>

          {/* Batch Actions */}
          {selectedArticles.length > 0 && (
            <div className="mt-4 flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="text-sm font-medium">
                已选择 {selectedArticles.length} 篇文章
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Send className="h-4 w-4 mr-2" />
                  批量发布
                </Button>
                <Button variant="outline" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  批量删除
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Articles List */}
      <div className="space-y-4">
        {filteredArticles.length > 0 ? (
          <>
            {/* Select All */}
            <div className="flex items-center gap-3 px-2">
              <input
                type="checkbox"
                checked={selectedArticles.length === filteredArticles.length && filteredArticles.length > 0}
                onChange={toggleSelectAll}
                className="h-4 w-4 rounded border-gray-300"
              />
              <span className="text-sm text-muted-foreground">全选</span>
            </div>

            {/* Article Cards */}
            {filteredArticles.map((article) => {
              const statusConfig = getStatusConfig(article.status)
              const StatusIcon = statusConfig.icon

              return (
                <Card key={article.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      {/* Checkbox */}
                      <div className="flex items-start pt-1">
                        <input
                          type="checkbox"
                          checked={selectedArticles.includes(article.id)}
                          onChange={() => toggleArticle(article.id)}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                      </div>

                      {/* Cover Image */}
                      <div className="w-40 h-28 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                        <span className="text-xs text-muted-foreground">封面缩略图</span>
                      </div>

                      {/* Article Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg line-clamp-2 mb-2">
                              {article.title}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                              <span>创建时间: {article.createdAt}</span>
                              {article.publishedAt && (
                                <span>发布时间: {article.publishedAt}</span>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge variant={statusConfig.variant}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {statusConfig.label}
                              </Badge>
                              {article.status === "published" && article.readCount && (
                                <>
                                  <span className="text-sm text-muted-foreground">
                                    阅读: {article.readCount.toLocaleString()}
                                  </span>
                                  <span className="text-sm text-muted-foreground">
                                    点赞: {article.likeCount}
                                  </span>
                                </>
                              )}
                              {article.status === "failed" && article.errorMessage && (
                                <span className="text-sm text-red-600">
                                  {article.errorMessage}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col gap-2">
                            {article.status === "draft" && (
                              <>
                                <Button size="sm" variant="outline">
                                  <Edit3 className="h-4 w-4 mr-2" />
                                  编辑
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Eye className="h-4 w-4 mr-2" />
                                  预览
                                </Button>
                                <Button size="sm">
                                  <Send className="h-4 w-4 mr-2" />
                                  发布
                                </Button>
                              </>
                            )}
                            {article.status === "published" && (
                              <>
                                <Button size="sm" variant="outline">
                                  <Eye className="h-4 w-4 mr-2" />
                                  查看数据
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Edit3 className="h-4 w-4 mr-2" />
                                  编辑
                                </Button>
                                <Button size="sm" variant="outline" asChild>
                                  <a href={article.wechatUrl} target="_blank" rel="noopener noreferrer">
                                    在公众号查看
                                  </a>
                                </Button>
                              </>
                            )}
                            {article.status === "failed" && (
                              <>
                                <Button size="sm" variant="outline">
                                  <Edit3 className="h-4 w-4 mr-2" />
                                  编辑
                                </Button>
                                <Button size="sm">
                                  <Send className="h-4 w-4 mr-2" />
                                  重新发布
                                </Button>
                              </>
                            )}
                            <Button size="sm" variant="ghost">
                              <Trash2 className="h-4 w-4 mr-2" />
                              删除
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </>
        ) : (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
                  <Search className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">没有找到文章</h3>
                <p className="text-sm text-muted-foreground">
                  {searchQuery ? "试试其他搜索词" : "暂无文章，去创作第一篇吧！"}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

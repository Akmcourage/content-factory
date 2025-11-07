"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart3, FileText, Send, TrendingUp, Clock, CheckCircle2 } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  // 模拟数据
  const stats = [
    {
      title: "本月分析",
      value: "15",
      description: "选题分析次数",
      icon: BarChart3,
      trend: "+12%",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "生成文章",
      value: "8",
      description: "AI 创作文章数",
      icon: FileText,
      trend: "+5",
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "已发布",
      value: "5",
      description: "成功发布到公众号",
      icon: Send,
      trend: "+3",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "总阅读",
      value: "12.5k",
      description: "累计阅读量",
      icon: TrendingUp,
      trend: "+23%",
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ]

  const recentArticles = [
    {
      id: 1,
      title: "如何提高工作效率的10个技巧",
      status: "draft",
      time: "2小时前",
      statusText: "草稿",
      statusVariant: "secondary" as const,
    },
    {
      id: 2,
      title: "AI时代的内容创作指南",
      status: "published",
      time: "1天前",
      statusText: "已发布",
      statusVariant: "success" as const,
    },
    {
      id: 3,
      title: "提升个人品牌影响力的5个方法",
      status: "draft",
      time: "2天前",
      statusText: "草稿",
      statusVariant: "secondary" as const,
    },
    {
      id: 4,
      title: "2024年内容营销趋势分析",
      status: "published",
      time: "3天前",
      statusText: "已发布",
      statusVariant: "success" as const,
    },
  ]

  const quickActions = [
    {
      title: "新建选题分析",
      description: "通过关键词搜索和AI分析发现热门选题",
      icon: BarChart3,
      href: "/analysis",
      color: "bg-blue-500",
    },
    {
      title: "AI创作文章",
      description: "基于选题洞察一键生成高质量文章",
      icon: FileText,
      href: "/creation",
      color: "bg-green-500",
    },
  ]

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">仪表盘</h1>
        <p className="text-muted-foreground mt-2">
          欢迎回来！这是你的内容工厂数据概览
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className={`${stat.bgColor} p-2 rounded-lg`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
              <p className={`text-xs font-medium mt-2 ${stat.color}`}>
                {stat.trend} 较上月
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">⚡ 快速操作</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {quickActions.map((action) => (
            <Link key={action.title} href={action.href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className={`${action.color} p-3 rounded-lg`}>
                      <action.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{action.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {action.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Articles */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">📝 最近文章</h2>
          <Link href="/publish">
            <Button variant="ghost" size="sm">
              查看全部
            </Button>
          </Link>
        </div>
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {recentArticles.map((article) => (
                <div
                  key={article.id}
                  className="flex items-center justify-between p-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-1">
                      {article.status === "published" ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <Clock className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{article.title}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {article.time}
                      </p>
                    </div>
                  </div>
                  <Badge variant={article.statusVariant}>
                    {article.statusText}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Image as ImageIcon, CheckCircle2, Loader2, Edit3, Save } from "lucide-react"

export default function CreationPage() {
  const [creationMode, setCreationMode] = useState<"insight" | "custom">("insight")
  const [selectedTopics, setSelectedTopics] = useState<number[]>([])
  const [customTopic, setCustomTopic] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [creationStep, setCreationStep] = useState(0)
  const [showPreview, setShowPreview] = useState(false)

  // 模拟选题洞察数据
  const insightTopics = [
    { id: 1, title: "实用工具类内容最受欢迎" },
    { id: 2, title: "新手入门指南有巨大需求" },
    { id: 3, title: "效率提升是核心痛点" },
    { id: 4, title: "数字化标题吸引眼球" },
    { id: 5, title: "实战案例比理论更受欢迎" },
  ]

  // 创作步骤
  const creationSteps = [
    { id: 1, name: "文章大纲已生成", completed: false },
    { id: 2, name: "正文创作完成", completed: false },
    { id: 3, name: "正在获取配图", completed: false },
    { id: 4, name: "文章创作完成", completed: false },
  ]

  // 模拟创作过程
  const handleCreate = () => {
    setIsCreating(true)
    setCreationStep(0)
    setShowPreview(false)

    // 模拟步骤进度
    const steps = [1000, 2000, 1500, 1000]
    let currentStep = 0

    const timer = setInterval(() => {
      currentStep++
      setCreationStep(currentStep)

      if (currentStep >= steps.length) {
        clearInterval(timer)
        setIsCreating(false)
        setShowPreview(true)
      }
    }, steps[currentStep] || 1000)
  }

  // 切换选题选择
  const toggleTopic = (topicId: number) => {
    setSelectedTopics(prev =>
      prev.includes(topicId)
        ? prev.filter(id => id !== topicId)
        : [...prev, topicId]
    )
  }

  // 模拟文章预览数据
  const mockArticle = {
    title: "AI时代如何用ChatGPT提升工作效率：10个实用技巧全解析",
    coverUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995",
    content: `
在AI技术飞速发展的今天，ChatGPT已经成为提升工作效率的得力助手。本文将为你详细介绍10个实用技巧，帮助你充分发挥ChatGPT的潜力。

## 1. 明确你的需求

在使用ChatGPT之前，首先要明确自己的需求。是需要写作辅助、数据分析，还是创意灵感？明确目标能让AI给出更精准的回答。

## 2. 善用提示词工程

提示词的质量直接影响AI的输出效果。学会使用结构化的提示词，可以让ChatGPT理解你的需求更加准确。

## 3. 迭代优化对话

不要期待一次就能得到完美答案。通过多轮对话，逐步优化和完善AI的输出，这是使用ChatGPT的正确姿势。
    `,
    images: [
      { id: 1, url: "https://images.unsplash.com/photo-1677442136019-21780ecad995", position: 1 },
      { id: 2, url: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e", position: 2 },
      { id: 3, url: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01", position: 3 },
    ],
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">✍️ 内容创作</h1>
        <p className="text-muted-foreground mt-2">
          基于选题洞察或自定义主题，AI一键生成高质量文章
        </p>
      </div>

      {/* Creation Mode Selection */}
      <Card>
        <CardHeader>
          <CardTitle>创作方式</CardTitle>
          <CardDescription>选择基于洞察选题或自定义主题创作</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button
              variant={creationMode === "insight" ? "default" : "outline"}
              onClick={() => setCreationMode("insight")}
              className="flex-1"
            >
              基于选题洞察
            </Button>
            <Button
              variant={creationMode === "custom" ? "default" : "outline"}
              onClick={() => setCreationMode("custom")}
              className="flex-1"
            >
              自定义主题
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Topic Selection */}
      {creationMode === "insight" ? (
        <Card>
          <CardHeader>
            <CardTitle>选择洞察选题</CardTitle>
            <CardDescription>从最新的选题洞察中选择一个或多个方向</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {insightTopics.map((topic) => (
                <div
                  key={topic.id}
                  onClick={() => toggleTopic(topic.id)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedTopics.includes(topic.id)
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-accent/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        selectedTopics.includes(topic.id)
                          ? "border-primary bg-primary"
                          : "border-muted-foreground"
                      }`}
                    >
                      {selectedTopics.includes(topic.id) && (
                        <CheckCircle2 className="h-4 w-4 text-primary-foreground" />
                      )}
                    </div>
                    <span className="font-medium">{topic.title}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>输入自定义主题</CardTitle>
            <CardDescription>输入你想要创作的文章主题或关键词</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="例如：如何利用AI工具提升内容创作效率..."
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              rows={4}
            />
          </CardContent>
        </Card>
      )}

      {/* Creation Settings */}
      <Card>
        <CardHeader>
          <CardTitle>创作设置</CardTitle>
          <CardDescription>自定义文章风格和参数</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">内容风格</label>
            <div className="grid grid-cols-4 gap-2">
              {["专业严谨", "轻松活泼", "干货实用", "故事叙述"].map((style) => (
                <Button key={style} variant="outline" size="sm">
                  {style}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">文章长度</label>
            <div className="grid grid-cols-3 gap-2">
              {["短篇 (500-800字)", "中等 (800-1200字)", "长篇 (1200-2000字)"].map((length) => (
                <Button key={length} variant="outline" size="sm">
                  {length}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">配图数量</label>
            <div className="grid grid-cols-4 gap-2">
              {["1-2张", "3-5张", "6-8张", "自动"].map((count) => (
                <Button key={count} variant="outline" size="sm">
                  {count}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create Button */}
      {!showPreview && (
        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={handleCreate}
            disabled={isCreating || (creationMode === "insight" && selectedTopics.length === 0) || (creationMode === "custom" && !customTopic)}
            className="px-8"
          >
            {isCreating ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                创作中...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 mr-2" />
                开始创作
              </>
            )}
          </Button>
        </div>
      )}

      {/* Creation Progress */}
      {isCreating && (
        <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              创作进度
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {creationSteps.map((step, index) => (
                <div key={step.id} className="flex items-center gap-3">
                  {index < creationStep ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                  ) : index === creationStep ? (
                    <Loader2 className="h-5 w-5 text-blue-600 animate-spin flex-shrink-0" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-muted flex-shrink-0" />
                  )}
                  <span
                    className={
                      index < creationStep
                        ? "text-green-600 font-medium"
                        : index === creationStep
                        ? "text-blue-600 font-medium"
                        : "text-muted-foreground"
                    }
                  >
                    {step.name}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Article Preview */}
      {showPreview && (
        <div className="space-y-4">
          <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
                <div>
                  <p className="font-semibold text-green-900 dark:text-green-100">
                    文章创作完成！
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    已自动保存到发布管理，你可以继续编辑或直接发布
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>文章预览</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Edit3 className="h-4 w-4 mr-2" />
                    编辑
                  </Button>
                  <Button size="sm">
                    <Save className="h-4 w-4 mr-2" />
                    保存草稿
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Title */}
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  文章标题
                </label>
                <Input
                  value={mockArticle.title}
                  className="text-lg font-semibold"
                  readOnly
                />
              </div>

              {/* Cover Image */}
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  封面图
                </label>
                <div className="w-full h-64 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                  <ImageIcon className="h-12 w-12 text-muted-foreground" />
                </div>
              </div>

              {/* Content Preview */}
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  正文内容
                </label>
                <div className="prose prose-sm max-w-none p-6 bg-muted/30 rounded-lg">
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {mockArticle.content}
                  </div>

                  {/* Article Images */}
                  <div className="grid grid-cols-3 gap-4 mt-6">
                    {mockArticle.images.map((image) => (
                      <div
                        key={image.id}
                        className="aspect-video bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center"
                      >
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Metadata */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>字数: 约 1,200 字</span>
                <span>配图: {mockArticle.images.length} 张</span>
                <span>预计阅读: 5 分钟</span>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4 justify-end">
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              重新创作
            </Button>
            <Button>提交到发布管理</Button>
          </div>
        </div>
      )}
    </div>
  )
}

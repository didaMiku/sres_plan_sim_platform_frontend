<script setup lang="ts">
import { computed, ref } from 'vue'
import { marked } from 'marked'
import { useRoute, useRouter } from 'vue-router'

import { createReport, REPORT_SECTIONS } from '@/api/reports'

const route = useRoute()
const router = useRouter()
const projectId = route.params.id

const title = ref('华东沿海工业园源网荷储一体化示范项目 · 规划报告')
const format = ref('md')
const selected = ref<string[]>([])
const markdown = ref('')
const filename = ref('')
const loading = ref(false)
const error = ref('')

const dragIndex = ref<number | null>(null)

const unselected = computed(() => REPORT_SECTIONS.filter((s) => !selected.value.includes(s.key)))
const html = computed(() => (markdown.value ? (marked.parse(markdown.value) as string) : ''))

function nameOf(key: string) {
  return REPORT_SECTIONS.find((s) => s.key === key)?.name ?? key
}

function addSection(key: string) {
  if (!selected.value.includes(key)) selected.value.push(key)
}

function removeSection(index: number) {
  selected.value.splice(index, 1)
}

function onDragStart(index: number) {
  dragIndex.value = index
}

function onDrop(index: number) {
  if (dragIndex.value === null || dragIndex.value === index) return
  const list = selected.value.slice()
  const [item] = list.splice(dragIndex.value, 1)
  if (item) list.splice(index, 0, item)
  selected.value = list
  dragIndex.value = null
}

async function generate() {
  if (!selected.value.length) {
    error.value = '请先选择章节'
    return
  }
  loading.value = true
  error.value = ''
  try {
    const result = await createReport(title.value, selected.value)
    markdown.value = result.markdown
    filename.value = result.filename
  } catch (e) {
    error.value = e instanceof Error ? e.message : '生成失败'
  } finally {
    loading.value = false
  }
}

function download() {
  if (!markdown.value) return
  const blob = new Blob([markdown.value], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename.value || 'report.md'
  a.click()
  URL.revokeObjectURL(url)
}

function back() {
  router.push(`/projects/${projectId}/dashboard`)
}
</script>

<template>
  <div class="page">
    <header class="topbar">
      <div class="left">
        <button @click="back">← 返回仪表盘</button>
        <strong>报告生成</strong>
      </div>
    </header>

    <main class="body">
      <aside class="col left">
        <h3>已选章节 <small>拖拽排序，点击移除</small></h3>
        <div class="picked">
          <div
            v-for="(key, i) in selected"
            :key="key"
            class="item picked-item"
            draggable="true"
            @dragstart="onDragStart(i)"
            @dragover.prevent
            @drop="onDrop(i)"
            @click="removeSection(i)"
          >
            <span class="handle">≡</span>{{ nameOf(key) }}
          </div>
          <p v-if="!selected.length" class="muted small">还没有选择章节</p>
        </div>

        <h3>未选章节 <small>点击加入</small></h3>
        <div class="unpicked">
          <button v-for="s in unselected" :key="s.key" class="item" @click="addSection(s.key)">
            + {{ s.name }}
          </button>
        </div>
      </aside>

      <section class="col preview">
        <h3>预览</h3>
        <div class="paper" v-html="html"></div>
        <p v-if="!html" class="empty">选择章节后点击「生成预览」</p>
      </section>

      <aside class="col right">
        <h3>报告属性</h3>
        <label class="label">报告标题</label>
        <input v-model="title" />

        <label class="label">输出格式</label>
        <label class="fmt"><input v-model="format" type="radio" value="md" /> Markdown</label>
        <label class="fmt disabled"><input type="radio" value="pdf" disabled /> PDF（暂不可用）</label>
        <label class="fmt disabled"><input type="radio" value="word" disabled /> Word（暂不可用）</label>

        <p v-if="error" class="err">{{ error }}</p>

        <div class="actions">
          <button class="primary" :disabled="loading" @click="generate">
            {{ loading ? '生成中…' : '生成预览' }}
          </button>
          <button :disabled="!markdown" @click="download">下载报告</button>
        </div>
      </aside>
    </main>
  </div>
</template>

<style scoped>
.page {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.topbar {
  height: 64px;
  padding: 0 clamp(18px, 3.4vw, 58px);
  display: flex;
  align-items: center;
  background: transparent;
  border-bottom: 1px solid var(--rule);
}

.left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.body {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: 280px 1fr 300px;
  gap: 12px;
  padding: 14px clamp(18px, 3.4vw, 58px) 24px;
}

.col {
  background: var(--paper-hi);
  border: 1px solid var(--rule);
  border-radius: 0;
  padding: 12px 14px;
  overflow: auto;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.col h3 {
  margin: 0 0 8px;
  font-family: var(--f-zh);
  font-size: 12px;
  letter-spacing: 0.14em;
  color: var(--ink-3);
}

.col h3 small {
  font-family: var(--f-tech);
  font-size: 9px;
  color: var(--ink-4);
  font-weight: 400;
  margin-left: 4px;
  letter-spacing: 0.12em;
}

.item {
  display: block;
  width: 100%;
  text-align: left;
  margin-bottom: 6px;
  padding: 8px 10px;
  background: transparent;
  border: 1px solid var(--rule);
  border-radius: 0;
  color: var(--ink);
  font-family: var(--f-zh);
  font-size: 12px;
  cursor: pointer;
}

.item:hover {
  background: rgba(26, 26, 24, 0.05);
}

.picked-item {
  cursor: grab;
  background: var(--paper-lo);
}

.handle {
  color: var(--ink-4);
  margin-right: 6px;
}

.unpicked {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.preview {
  background: transparent;
}

.paper {
  flex: 1;
  min-height: 0;
  background: #fff;
  color: #1a1a18;
  border: 1px solid var(--rule);
  border-radius: 0;
  padding: 26px 30px;
  overflow: auto;
  font-size: 13px;
  line-height: 1.8;
}

.paper :deep(h1) {
  font-size: 20px;
  margin: 0 0 12px;
}

.paper :deep(h2) {
  font-size: 16px;
  margin: 18px 0 8px;
  padding-bottom: 4px;
  border-bottom: 1px solid #eee;
}

.paper :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 8px 0;
}

.paper :deep(th),
.paper :deep(td) {
  border: 1px solid #ddd;
  padding: 4px 8px;
  font-size: 12px;
}

.paper :deep(th) {
  background: #f5f5f5;
}

.paper :deep(ul),
.paper :deep(ol) {
  padding-left: 20px;
}

.paper :deep(blockquote) {
  margin: 8px 0;
  padding: 6px 12px;
  border-left: 3px solid #ccc;
  color: #666;
  background: #fafafa;
}

.empty {
  color: var(--ink-4);
  font-size: 12px;
  text-align: center;
  margin-top: 40px;
}

.label {
  font-family: var(--f-tech);
  font-size: 9.5px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--ink-4);
  margin: 12px 0 5px;
}

.fmt {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  padding: 4px 0;
}

.fmt input {
  width: auto;
}

.fmt.disabled {
  color: var(--ink-4);
  opacity: 0.6;
}

.actions {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.err {
  color: var(--red);
  font-size: 12px;
}
</style>

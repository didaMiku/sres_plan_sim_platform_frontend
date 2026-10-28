<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import * as XLSX from 'xlsx'

import { fetchHistory, type ImportRecordItem } from '@/api/imports'
import { fetchTypes, type FieldDef, type TypeDef } from '@/api/schema'
const route = useRoute()
const router = useRouter()
const projectId = route.params.id
const types = ref<TypeDef[]>([])
const activeType = ref<TypeDef>({ code: '', name: '', description: null, fields: [] })
const loading = ref(true)
const history = ref<ImportRecordItem[]>([])
const file = ref<File | null>(null)
const header = ref<string[]>([]) // 文件表头
const sample = ref<string[]>([]) // 第一行样例值
const mapping = ref<Record<string, string>>({}) // 源列名 -> 数据库字段
const submitting = ref(false)
const errorMsg = ref('')
const okMsg = ref('')
const requiredFields = computed(() => activeType.value.fields.filter((f) => f.required))

// 页面打开时拉字段字典 + 导入历史
onMounted(async () => {
  await Promise.all([loadTypes(), loadHistory()])
})

async function loadTypes() {
  try {
    types.value = await fetchTypes()
    if (types.value.length) activeType.value = types.value[0]!
  } catch (e) {
    errorMsg.value = e instanceof Error ? e.message : '加载数据类型失败'
  } finally {
    loading.value = false
  }
}

async function loadHistory() {
  try {
    history.value = await fetchHistory()
  } catch {
    /* 历史加载失败不打扰用户 */
  }
}

function selectType(t: TypeDef) {
  if (activeType.value.code === t.code) return
  activeType.value = t
  header.value = []
  sample.value = []
  mapping.value = {}
  file.value = null
  errorMsg.value = ''
  okMsg.value = ''
}
async function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  const f = input.files?.[0]
  if (!f) return
  await readFile(f)
  input.value = '' // 清空，方便重复选同一个文件
}
async function readFile(f: File) {
  file.value = f
  errorMsg.value = ''
  okMsg.value = ''

  const isExcel = /\.(xlsx|xls)$/i.test(f.name)
  let head: string[] = []
  let first: string[] = []

  if (isExcel) {
    // xlsx 是二进制（本质是 zip），用 SheetJS 读第一个工作表
    const buf = await f.arrayBuffer()
    const wb = XLSX.read(buf, { type: 'array' })
    const sheetName = wb.SheetNames[0]
    const ws = sheetName ? wb.Sheets[sheetName] : undefined
    if (ws) {
      const rows = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false }) as unknown[][]
      head = (rows[0] ?? []).map((v) => String(v ?? '').trim())
      first = (rows[1] ?? []).map((v) => String(v ?? '').trim())
    }
  } else {
    // csv：只读前 8KB，够拿表头和第一行
    const text = await f.slice(0, 8192).text()
    const lines = text
      .replace(/^\ufeff/, '')
      .split(/\r?\n/)
      .filter((l) => l.trim() !== '')
    head = (lines[0] ?? '').split(',').map((s) => s.trim())
    first = (lines[1] ?? '').split(',').map((s) => s.trim())
  }

  header.value = head
  sample.value = first
  // 列名和字段名完全一致的先自动对上，剩下的手动选
  const auto: Record<string, string> = {}
  for (const col of head) {
    auto[col] = activeType.value.fields.some((fd) => fd.key === col) ? col : ''
  }
  mapping.value = auto
}
function onMap(col: string, key: string) {
  mapping.value[col] = key
}
function fieldLabel(f: FieldDef) {
  return `${f.name}${f.unit ? ` (${f.unit})` : ''} · ${f.key}`
}
async function submit() {
  errorMsg.value = ''
  okMsg.value = ''
  if (!file.value) {
    errorMsg.value = '请先选择文件'
    return
  }
  const picked = Object.values(mapping.value)
  const missing = requiredFields.value.filter((f) => !picked.includes(f.key))
  if (missing.length) {
    errorMsg.value = `必填字段还没对应：${missing.map((m) => m.name).join('、')}`
    return
  }
  const fd = new FormData()
  fd.append('file', file.value)
  fd.append('type_code', activeType.value.code)
  fd.append('mapping', JSON.stringify(mapping.value))
  submitting.value = true
  try {
    const res = await fetch('/api/imports', { method: 'POST', body: fd, credentials: 'include' })
    if (res.status === 401) {
      await router.replace('/login')
      return
    }
    if (!res.ok) {
      let detail: unknown = `HTTP ${res.status}`
      try {
        const body = await res.json()
        detail = body?.detail ?? detail
      } catch {
        /* 响应不是 JSON */
      }
      throw new Error(typeof detail === 'string' ? detail : '导入失败')
    }
    const data = await res.json()
    const dropped = data?.dropped ?? 0
    okMsg.value = `导入成功：写入 ${data?.row_count ?? '?'} 行${dropped ? `，丢弃 ${dropped} 行` : ''}`
    await loadHistory()
    file.value = null
    header.value = []
    sample.value = []
    mapping.value = {}
  } catch (e) {
    errorMsg.value = e instanceof Error ? e.message : '导入失败'
  } finally {
    submitting.value = false
  }
}
</script>
<template>
  <div class="page">
    <header class="topbar">
      <div class="left">
        <button @click="router.push(`/projects/${projectId}/dashboard`)">← 返回仪表盘</button>
        <strong>数据导入</strong>
      </div>
    </header>
    <div class="body">
      <!-- 左侧：类型选择 -->
      <aside class="sidebar">
        <p class="side-title muted">数据类型</p>
        <p v-if="loading" class="muted small">加载中…</p>
        <button v-for="t in types" :key="t.code" class="type-item" :class="{ active: t.code === activeType.code }"
          @click="selectType(t)">
          <span class="type-name">{{ t.name }}</span>
          <span class="type-desc muted">{{ t.description }}</span>
        </button>
      </aside>
      <!-- 右侧：上传 + 映射 -->
      <main class="main">
        <div class="card upload">
          <p>
            <strong>{{ activeType.name }}</strong>
            <span class="muted">（{{ activeType.fields.length }} 个字段）</span>
          </p>
          <label class="pick">
            <input type="file" accept=".csv,.xlsx,.xls,text/csv" @change="onFileChange" />
            <span class="btn">选择文件</span>
          </label>
          <p v-if="file" class="muted small">已选：{{ file.name }}（{{ (file.size / 1024).toFixed(1) }} KB）</p>
          <p v-else class="muted small">支持 .csv / .xlsx，首行为表头</p>
        </div>
        <!-- 有文件才显示映射表 -->
        <template v-if="header.length">
          <h3>字段映射</h3>
          <p class="muted small">左侧是文件里的列，右侧选它对应哪个数据库字段；不需要的列选"忽略"。</p>
          <div class="card table">
            <div class="tr th">
              <span>文件列名</span>
              <span>样例值</span>
              <span>对应字段</span>
            </div>
            <div v-for="(col, i) in header" :key="col + i" class="tr">
              <span class="col">{{ col }}</span>
              <span class="sample muted">{{ sample[i] ?? '' }}</span>
              <select :value="mapping[col] ?? ''" @change="onMap(col, ($event.target as HTMLSelectElement).value)">
                <option value="">— 忽略 —</option>
                <option v-for="f in activeType.fields" :key="f.key" :value="f.key">
                  {{ fieldLabel(f) }}{{ f.required ? ' *' : '' }}
                </option>
              </select>
            </div>
          </div>
          <p v-if="errorMsg" class="err">{{ errorMsg }}</p>
          <p v-if="okMsg" class="ok">{{ okMsg }}</p>
          <div class="actions">
            <span class="muted small">
              必填：{{requiredFields.map((f) => f.name).join('、')}}
            </span>
            <button class="primary" :disabled="submitting" @click="submit">
              {{ submitting ? '导入中…' : '确认导入' }}
            </button>
          </div>
        </template>
        <p v-else class="muted hint">先在左侧选择数据类型，再上传文件</p>

        <!-- 最近导入 -->
        <template v-if="history.length">
          <h3>最近导入</h3>
          <div class="card table">
            <div class="tr hist th">
              <span>文件</span>
              <span>类型</span>
              <span>行数</span>
              <span>时间</span>
            </div>
            <div v-for="h in history" :key="h.id" class="tr hist">
              <span class="col">{{ h.original_filename }}</span>
              <span class="muted">{{ h.type_code }}</span>
              <span>{{ h.row_count }}</span>
              <span class="muted">{{ h.created_at }}</span>
            </div>
          </div>
        </template>
      </main>
    </div>
  </div>
</template>
<style scoped>
.page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.topbar {
  height: 56px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  background: #0e1729;
  border-bottom: 1px solid #1f2f47;
}

.left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.body {
  flex: 1;
  display: flex;
  gap: 16px;
  padding: 16px;
  min-height: 0;
}

.sidebar {
  width: 240px;
  flex: 0 0 240px;
  padding: 12px;
  background: #101c30;
  border: 1px solid #1f2f47;
  border-radius: 10px;
  align-self: flex-start;
}

.side-title {
  font-size: 12px;
  margin: 0 0 10px 4px;
}

.type-item {
  display: block;
  width: 100%;
  text-align: left;
  margin-bottom: 8px;
  padding: 10px 12px;
  background: transparent;
  border: 1px solid #1f2f47;
}

.type-item.active {
  border-color: #2aa387;
  background: #102b26;
}

.type-name {
  display: block;
  font-size: 13px;
  color: #dbe3f0;
}

.type-desc {
  display: block;
  font-size: 11px;
  margin-top: 3px;
}

.main {
  flex: 1;
  min-width: 0;
  overflow: auto;
}

.upload {
  padding: 18px 20px;
  margin-bottom: 20px;
}

.upload p {
  margin: 0 0 10px;
}

.pick input {
  display: none;
}

.btn {
  display: inline-block;
  padding: 8px 14px;
  border: 1px solid #2aa387;
  border-radius: 6px;
  color: #5ee0c0;
  cursor: pointer;
}

.small {
  font-size: 12px;
}

h3 {
  font-size: 14px;
  margin: 0 0 4px;
}

.table {
  margin-top: 10px;
  padding: 4px 12px;
}

.tr {
  display: grid;
  grid-template-columns: 1.2fr 1fr 1.6fr;
  gap: 12px;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #1a2940;
}

.tr.hist {
  grid-template-columns: 2fr 1fr 0.6fr 1.5fr;
}

.tr:last-child {
  border-bottom: none;
}

.th {
  font-size: 12px;
  color: #9fb0c9;
}

.col {
  font-family: ui-monospace, Consolas, monospace;
  font-size: 12px;
}

.sample {
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

select {
  font: inherit;
  background: #0f1a2c;
  color: #dbe3f0;
  border: 1px solid #2a3a55;
  border-radius: 6px;
  padding: 7px 9px;
  width: 100%;
}

.actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16px;
}

.err {
  color: #ff7a7a;
  font-size: 13px;
  margin: 12px 0 0;
}

.ok {
  color: #5ee0c0;
  font-size: 13px;
  margin: 12px 0 0;
}

.hint {
  margin-top: 40px;
  text-align: center;
}
</style>
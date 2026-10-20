<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const projectId = route.params.id

const templates = ['标准规划报告', '经济性分析报告', '碳减排评估报告', '友好性评价报告']
const chapters = [
  '项目概况',
  '基础数据说明',
  '资源条件分析',
  '负荷特性分析',
  '建模方法说明',
  '容量优化结果',
  '运行仿真结果',
  '经济性分析',
  '低碳效益分析',
  '友好性评价',
  '敏感性分析',
  '推荐配置方案',
  '风险与建议',
]

const activeTemplate = ref(templates[0])
const checked = ref<string[]>(['项目概况', '容量优化结果', '运行仿真结果'])

function toggle(name: string) {
  const i = checked.value.indexOf(name)
  if (i >= 0) checked.value.splice(i, 1)
  else checked.value.push(name)
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

    <main class="content">
      <div class="cols">
        <section class="col">
          <h3>报告模板</h3>
          <div class="card box">
            <button
              v-for="t in templates"
              :key="t"
              class="tpl"
              :class="{ active: t === activeTemplate }"
              @click="activeTemplate = t"
            >
              {{ t }}
            </button>
          </div>
        </section>

        <section class="col">
          <h3>内容章节</h3>
          <div class="card box">
            <label v-for="c in chapters" :key="c" class="chk">
              <input type="checkbox" :checked="checked.includes(c)" @change="toggle(c)" />
              <span>{{ c }}</span>
            </label>
          </div>
        </section>

        <section class="col preview">
          <h3>报告预览</h3>
          <div class="card box a4">
            <p class="muted">{{ activeTemplate }}</p>
            <h4>1. 项目概况</h4>
            <p class="muted small">（预览区，稍后接入后端生成的报告内容）</p>
            <h4>2. 资源条件分析</h4>
            <p class="muted small">（表格占位）</p>
            <h4>3. 容量优化结果</h4>
            <p class="muted small">（表格占位）</p>
          </div>
        </section>
      </div>

      <div class="footer">
        <span class="muted">已选 {{ checked.length }} 个章节</span>
        <button class="primary" disabled>生成报告（待接入）</button>
      </div>
    </main>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
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

.content {
  padding: 20px;
}

.cols {
  display: grid;
  grid-template-columns: 220px 240px 1fr;
  gap: 16px;
}

h3 {
  font-size: 13px;
  margin: 0 0 10px;
  color: #9fb0c9;
}

.box {
  padding: 12px;
}

.tpl {
  display: block;
  width: 100%;
  text-align: left;
  margin-bottom: 8px;
}

.tpl.active {
  border-color: #2aa387;
  background: #12312b;
}

.chk {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 0;
  font-size: 13px;
  cursor: pointer;
}

.chk input {
  width: auto;
}

.a4 {
  min-height: 420px;
  line-height: 1.7;
}

.a4 h4 {
  font-size: 14px;
  margin: 16px 0 4px;
}

.small {
  font-size: 12px;
}

.footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16px;
}
</style>

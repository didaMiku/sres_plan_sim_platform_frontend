# 友好型源网荷储一体化规划配置仿真平台 · 前端

Vue 3 + TypeScript + Vite 实现的界面层。配套后端见 `sres_plan_sim_platform_backend`（Python + FastAPI + SQLite）。

## 启动

```bash
npm install
npm run dev
```

打开 http://localhost:5173 ，默认账号 `admin / 1234`。

`vite.config.ts` 已配置代理：所有 `/api` 请求转发到 `http://127.0.0.1:8000`，因此浏览器看到的始终是同源请求，Cookie 可以正常携带。

```bash
npm run type-check   # vue-tsc 类型检查
npm run build        # 类型检查 + 生产构建
```

## 页面与路由

| 路由 | 页面 | 说明 |
|---|---|---|
| `/login` | `LoginView.vue` | 管理员登录 |
| `/projects` | `ProjectsView.vue` | 项目管理（项目卡片列表） |
| `/projects/:id/dashboard` | `DashboardView.vue` | 项目仪表盘：KPI、图表区、指标卡 |
| `/projects/:id/imports` | `ImportsView.vue` | 数据导入：选类型 → 上传 → 列映射 → 入库，附导入历史 |
| `/projects/:id/reports` | `ReportsView.vue` | 报告生成：模板、章节勾选、预览 |

路由守卫：进入非 `/login` 页面时先请求 `GET /api/auth/me`，未登录跳转登录页并记录回跳地址。

## 目录结构

```
src/
├── api/
│   ├── http.ts        请求封装（401 识别、错误提取、204 处理）
│   ├── auth.ts        login / me / logout
│   ├── schema.ts      数据类型与字段字典
│   └── imports.ts     导入历史
├── stores/
│   └── auth.ts        Pinia：当前管理员与登录状态
├── router/
│   └── index.ts       路由表 + 登录守卫
├── views/             5 个页面
├── App.vue            根组件 + 全局暗色主题
└── main.ts            应用入口
```

## 当前状态

- ✅ 登录、路由守卫、数据导入（含列映射、结果提示、导入历史）
- ⏳ 仪表盘：布局与指标卡已完成，**图表为占位**，数据为示例值
- ⏳ 报告生成：模板/章节/预览布局已完成，**未接后端生成接口**
- ⏳ 项目管理：项目卡片数据**写死在前端**，待接 `GET /api/projects`

完整的需求说明、数据库设计与待办清单见后端仓库的 `README.md`。

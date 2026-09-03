# 梦之城AI赋能中心 · 课程体系文档索引

> 本文档是课程体系规划的唯一入口，汇总所有课程大纲、技术方案与迭代记录。

---

## 一、现有文档结构

| 文件 | 位置 | 说明 | 状态 |
|---|---|---|---|
| `COURSES_PLAN.md` | 项目根目录 | 全站课程融合规划（产品模式、技术架构、页面清单、阶段计划） | 已确认 |
| `course-01-ecommerce.md` | `docs/courses/` | 《AI 个人电商实战》完整课程方案 | 已上架，8课视频已完成 |
| `course-02-digital-literacy.md` | `docs/courses/` | 《AI 时代个人数字素养进阶课》完整大纲 | 已上架，6讲视频已完成 |
| `course-03-opc.md` | `docs/courses/` | 《AI 时代个人品牌搭建》课程规划 | 规划中，已上架（视频占位） |
| `rbac.md` | `docs/` | RBAC 账号体系 + Supabase 迁移方案 | 开发期框架已落地 |

> **历史遗留文件说明**：根目录原 `SOLUTION.md`（电商课方案）、`course_2.md`（数字基础课草案）已整合进上表规范命名，建议后续归档到 `docs/_archive/`。

---

## 二、文档规范化建议

### 2.1 命名规则（已执行）
- 课程规划统一格式：`course-<序号>-<slug>.md`
- 序号与 `app/lib/data.ts` 中的 `course.id` 保持一致
- slug 与 `course.slug` 保持一致（kebab-case）

### 2.2 内容模板（每门课程文档必须包含）
```markdown
# 课程名称

## 一、课程定位
- 目标用户
- 课程承诺 / 结业产出

## 二、课程内容体系
### 模块 N：标题
- 核心知识点
- 实操任务

## 三、视频生产规范
- 视频命名：`{slug}_module<N>.mp4`
- 存放路径：`public/courses/{slug}/<NN-title>/`
- 配音：edge-tts zh-CN-XiaoxiaoNeural，rate +8%
- 结尾话术：仅保留"关注梦之城 AI + 下一步行动"，禁止引导评论

## 四、课时映射表
| 模块 | 课时ID | 视频文件名 | data.ts 对应 videoUrl |
```

### 2.3 目录结构建议
```
docs/
├── courses/
│   ├── README.md              # 本文件：课程总索引
│   ├── course-01-ecommerce.md
│   ├── course-02-digital-literacy.md
│   └── course-03-opc.md
├── rbac.md                    # 账号与权限体系
└── _archive/                  # 历史文档归档（建议）
    ├── SOLUTION.md
    └── course_2.md
```

---

## 三、课程数据对照表

| ID | Slug | 标题 | 模块数 | 视频状态 | 封面图 |
|---|---|---|---|---|---|
| 1 | `ai-ecommerce` | AI 个人电商实战 | 8 | ✅ 已完成 | `/img/banner-ecommerce.png` |
| 2 | `ai-digital-literacy` | AI 时代个人数字素养进阶课 | 6 | ✅ 已完成 | `/img/banner-digital.png` |
| 3 | `ai-opc` | AI 时代个人品牌搭建 | 8 | ⏳ 占位 | `/img/banner-opc.png` |

---

## 四、后续迭代计划

- [ ] 课程3视频制作（HyperFrames + edge-tts）
- [ ] 将 `COURSES_PLAN.md` 中"阶段计划"更新为已完成状态
- [ ] 统一归档根目录历史文档到 `docs/_archive/`
- [ ] 补充课程3的详细逐字稿与分镜脚本

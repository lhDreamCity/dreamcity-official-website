import type { Course, Lesson } from "./types";

/* ============================================================
   课程数据源
   当前以本地静态数据维护，后续可平滑迁移至服务端数据库。

   videoUrl 故意保留为相对路径（/courses/...），不要拼域名。
   渲染时由 app/lib/media.ts 的 videoUrlFor() 根据
   NEXT_PUBLIC_COS_BASE_URL 决定走 COS 还是本地 public/courses/。
   ============================================================ */

function lesson(
  id: number,
  title: string,
  sort: number,
  duration: string,
  summary: string,
  videoUrl: string | null = null
): Lesson {
  return { id, title, sort, duration, summary, videoUrl };
}

export const courses: Course[] = [
  {
    id: 1,
    slug: "ai-ecommerce",
    title: "AI 个人电商实战",
    subtitle: "一个人从 0 到 1 跑通第一单",
    description:
      "不教底层技术原理，只教「用 AI 把个人电商最小闭环跑通」。开一个店铺、上架 3 个商品、发布 5 条 AI 内容、尝试获取第一单。",
    cover: "/img/banner-ecommerce.png",
    price: null,
    duration: "7 天 · 8 个模块",
    level: "零基础",
    status: "published",
    lessons: [
      lesson(
        1,
        "模块 0：开营与认知校准",
        0,
        "30 分钟",
        "认识个人电商 OPC：一个人 + AI = 微型电商公司，明确最小闭环：选品 → 上架 → 内容 → 出单 → 发货 → 复盘。",
        "/courses/ai-ecommerce/00-kaishou/ecommerce_module0.mp4"
      ),
      lesson(
        2,
        "模块 1：AI 工具准备（零基础）",
        1,
        "45 分钟",
        "对话、图片、视频、办公、代码五类 AI 工具清单，注册操作与提示词基础：角色 + 任务 + 背景 + 格式。",
        "/courses/ai-ecommerce/01-tools/ecommerce_module1.mp4"
      ),
      lesson(
        3,
        "模块 2：AI 选品（最基础版）",
        2,
        "50 分钟",
        "轻小件、低售后、高复购的选品原则，小白最容易出单的 5 类商品，用 AI 辅助选品并快速验证需求。",
        "/courses/ai-ecommerce/02-kuanshu/ecommerce_module2.mp4"
      ),
      lesson(
        4,
        "模块 3：开店与上架（手把手）",
        3,
        "55 分钟",
        "平台选择与对比，以闲鱼/小红书为例演示开店流程，用 AI 准备标题、描述、主图、定价并完成上架。",
        "/courses/ai-ecommerce/03-kaidian/ecommerce_module3.mp4"
      ),
      lesson(
        5,
        "模块 4：AI 内容营销获客",
        4,
        "50 分钟",
        "流量来源拆解，用 AI 生成商品笔记与短视频脚本，发布节奏与引导成交，拆解一条笔记如何带来第一单。",
        "/courses/ai-ecommerce/04-neirong/ecommerce_module4.mp4"
      ),
      lesson(
        6,
        "模块 5：订单、发货与客服",
        5,
        "45 分钟",
        "出单后的发货流程、一件代发基础、AI 客服话术与售后处理，建立简单的收支记账。",
        "/courses/ai-ecommerce/05-dingdan/ecommerce_module5.mp4"
      ),
      lesson(
        7,
        "模块 6：数据复盘与迭代",
        6,
        "40 分钟",
        "看哪些数据，用 AI 分析数据找问题给建议，迭代方向与从第一单到稳定出单的放大路径。",
        "/courses/ai-ecommerce/06-fupan/ecommerce_module6.mp4"
      ),
      lesson(
        8,
        "模块 7：结业实战：跑通第一单",
        7,
        "40 分钟",
        "最终实战任务：开店、上架、发内容、尝试成交、完整复盘，产出个人电商 OPC 一页纸方案。",
        "/courses/ai-ecommerce/07-jieye/ecommerce_module7.mp4"
      ),
    ],
  },
  {
    id: 2,
    slug: "ai-digital-literacy",
    title: "AI 时代个人数字素养进阶课",
    subtitle: "从工具使用者到 AI 工作流设计师",
    description:
      "面向「会用 AI 聊天但不知如何深度嵌入工作」的进阶者。国内工具优先、合规使用优先、实战落地优先：看懂 2026 国内 AI 生态，把对话工具、Agent 与知识库组合成自己的生产力工作流。",
    cover: "/img/banner-digital.png",
    price: null,
    duration: "6 讲 · 约 14 分钟/讲",
    level: "进阶",
    status: "published",
    lessons: [
      lesson(
        1,
        "第 1 讲：国内 AI 生态地图与工具选型",
        0,
        "2:47",
        "看清 2026 国内 AI 格局：对话型（豆包/DeepSeek/Kimi/通义/文心）、Agent 型（WorkBuddy/豆包工作/Trae Work）、编程 IDE，学会按任务切模型。",
        "/courses/ai-digital-literacy/01-shengtai/digital_module01.mp4"
      ),
      lesson(
        2,
        "第 2 讲：AI 辅助办公与知识管理",
        1,
        "2:19",
        "从「先写再润色」转为「用 AI 生成骨架」。文档/表格/演示一站打通，用飞书知识库、语雀、石墨搭建 AI 可读取的知识库。",
        "/courses/ai-digital-literacy/02-bangong/digital_module02.mp4"
      ),
      lesson(
        3,
        "第 3 讲：看懂技术架构：模型、API 与商业模式",
        2,
        "2:08",
        "读懂科技新闻背后的技术逻辑：前端/后端/数据库/服务器、API/SDK/插件、开源与闭源、SaaS 与本地部署的商业模式。",
        "/courses/ai-digital-literacy/03-jiagou/digital_module03.mp4"
      ),
      lesson(
        4,
        "第 4 讲：模型能力边界与提示词进阶",
        3,
        "2:19",
        "大模型不是全知全能：概率接龙、上下文窗口、Token。进阶提示词 RTFC、思维链、Few-shot、系统提示词，以及幻觉识别三招。",
        "/courses/ai-digital-literacy/04-tishi/digital_module04.mp4"
      ),
      lesson(
        5,
        "第 5 讲：合规使用与数据安全",
        4,
        "2:10",
        "先把网络现实说清，再讲数据安全与版权。国内工具已够用，守住医疗/法律/财务等高风险场景的边界，养成隐私保护习惯。",
        "/courses/ai-digital-literacy/05-compliance/digital_module05.mp4"
      ),
      lesson(
        6,
        "第 6 讲：跨客户端接入与 API 调用进阶",
        5,
        "4:02",
        "把同一模型底座接到最常用的客户端：API 是标准入口，ChatBox/LobeChat/NextChat 三件套接入，进阶认识 MCP，让模型能动手。",
        "/courses/ai-digital-literacy/06-api/digital_module06.mp4"
      ),
    ],
  },
  {
    id: 3,
    slug: "ai-opc",
    title: "AI 时代个人品牌搭建",
    subtitle: "从 0 到 1 打造你的影响力资产",
    description:
      "不教空洞成功学，只教「用 AI 工具低成本搭建个人品牌最小闭环」。完成个人定位画布、30条选题库、AI辅助内容生产与变现路径设计。",
    cover: "/img/banner-opc.png",
    price: null,
    duration: "14 天 · 8 个模块",
    level: "零基础",
    status: "published",
    lessons: [
      lesson(
        1,
        "模块 1：个人品牌认知与 AI 时代机遇",
        0,
        "40 分钟",
        "建立个人品牌核心认知：定位、内容、信任三要素。理解 AI 如何降低品牌建设门槛，明确最小闭环路径。",
        "/courses/ai-opc/01-renzhi/opc_module1.mp4"
      ),
      lesson(
        2,
        "模块 2：AI 辅助个人定位与人设打造",
        1,
        "50 分钟",
        "定位公式与竞品调研（AI辅助），人设类型与差异化标签设计，完成个人品牌定位画布。",
        "/courses/ai-opc/02-dingwei/opc_module2.mp4"
      ),
      lesson(
        3,
        "模块 3：内容战略与选题规划",
        2,
        "45 分钟",
        "内容漏斗模型（引流/信任/转化），用 AI 批量生成选题并建立选题库，制定每周内容日历。",
        "/courses/ai-opc/03-neirong/opc_module3.mp4"
      ),
      lesson(
        4,
        "模块 4：AI 内容生产实战",
        3,
        "55 分钟",
        "AI 图文生产（小红书/公众号/朋友圈）与短视频脚本生成，建立 3-5 个固定内容模板实现批量产出。",
        "/courses/ai-opc/04-shengchan/opc_module4.mp4"
      ),
      lesson(
        5,
        "模块 5：平台运营与算法分发",
        4,
        "50 分钟",
        "小红书、抖音、公众号、B站平台特性对比与账号品牌一致性优化，用 AI 分析数据并生成跨平台分发策略。",
        "/courses/ai-opc/05-pingtai/opc_module5.mp4"
      ),
      lesson(
        6,
        "模块 6：私域流量与社群运营",
        5,
        "45 分钟",
        "公域到私域的引流路径设计，AI 辅助私域运营（欢迎语/朋友圈/社群规则），建立可持续的用户关系。",
        "/courses/ai-opc/06-siyu/opc_module6.mp4"
      ),
      lesson(
        7,
        "模块 7：商业变现模式设计",
        6,
        "50 分钟",
        "个人品牌变现金字塔（广告/知识付费/自有产品），用 AI 设计咨询产品、知识产品与转化文案。",
        null
      ),
      lesson(
        8,
        "模块 8：品牌升级与长期运营",
        7,
        "40 分钟",
        "数据复盘体系与 AI 健康度报告，内容迭代与品牌升级路径，建立内容 SOP 实现每周 3 小时高效运营。",
        null
      ),
    ],
  },
];

export function getCourseBySlug(slug: string): Course | undefined {
  return courses.find((c) => c.slug === slug);
}

export function getLesson(courseSlug: string, lessonId: number): { course: Course; lesson: Lesson } | undefined {
  const course = getCourseBySlug(courseSlug);
  if (!course) return undefined;
  const lesson = course.lessons.find((l) => l.id === Number(lessonId));
  if (!lesson) return undefined;
  return { course, lesson };
}



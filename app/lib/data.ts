import type { Course, Lesson } from "./types";

/* ============================================================
   当前课程数据（本地 mock，Supabase 占位）
   仅第 1 门：《AI 个人电商实战》—— 多门结构已支持，后续可扩展
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
    slug: "ai-personal-ecommerce",
    title: "AI 个人电商实战",
    subtitle: "一个人从 0 到 1 跑通第一单",
    description:
      "不教底层技术原理，只教「用 AI 把个人电商最小闭环跑通」。开一个店铺、上架 3 个商品、发布 5 条 AI 内容、尝试获取第一单。",
    cover: "/img/banner-opc.png",
    price: null, // 统一走全站会员
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
    title: "AI 时代个人数字基础课",
    subtitle: "从电脑小白到 AI 熟练用户",
    description:
      "作为整套课程体系的前置基础课，让学员从「只会刷手机」变成「能自主配置、灵活使用 AI 的数字化个体」。覆盖电脑、办公软件、IT 认知、AI 基础、API 配置与工具链搭建。",
    cover: "/img/banner-digital.png",
    price: null, // 统一走全站会员
    duration: "14 天 · 8 个模块",
    level: "零基础",
    status: "published",
    lessons: [
      lesson(
        1,
        "模块 1：计算机通用知识基础",
        0,
        "45 分钟",
        "电脑手机平板的区别、操作系统、文件管理、常见文件格式、软件安装、浏览器、账号体系与文件备份。",
        "/courses/ai-digital-literacy/01-jisuanji/ai_base_module1.mp4"
      ),
      lesson(
        2,
        "模块 2：基本办公软件",
        1,
        "50 分钟",
        "WPS/Office 与云协作平台选择，文档、表格、演示处理，用 AI 生成文档、公式、PPT 大纲并完成云协作。",
        "/courses/ai-digital-literacy/02-office/ai_base_module2.mp4"
      ),
      lesson(
        3,
        "模块 3：IT 行业与软件架构认知",
        2,
        "45 分钟",
        "软件是怎么做出来的（前端/后端/数据库/服务器），软件形态、部署方式、商业模式与常用术语（API/SDK/插件）。",
        "/courses/ai-digital-literacy/03-it/ai_base_module3.mp4"
      ),
      lesson(
        4,
        "模块 4：AI 基础认知",
        3,
        "55 分钟",
        "机器学习/深度学习/生成式 AI、大模型原理、常见 AI 类型、模型与 Agent 区别、Token/上下文/温度/RAG 等关键概念与提示词基础。",
        "/courses/ai-digital-literacy/04-ai/ai_base_module4.mp4"
      ),
      lesson(
        5,
        "模块 5：网络访问与合规上网",
        4,
        "2:50",
        "网络基础（IP/域名/DNS/HTTPS）、国内互联网管理政策、合法合规访问方式、国内优秀 AI 工具替代方案、数据隐私保护习惯。",
        "/courses/ai-digital-literacy/05-wangluo/ai_base_module5.mp4"
      ),
      lesson(
        6,
        "模块 6：自定义配置与 API 使用",
        5,
        "3:18",
        "API 概念与餐厅服务员比喻、网页使用 vs API 使用、主流 AI API 服务对比、六步获取配置 API Key、Token 计费与成本控制、Ollama/LM Studio 本地模型。",
        "/courses/ai-digital-literacy/06-api/ai_base_module6.mp4"
      ),
      lesson(
        7,
        "模块 7：工具生态与实战推荐",
        6,
        "3:07",
        "核心能力回顾、最小可行工具栈六类推荐（办公/对话/图像/视频/知识/自动化）、组合使用实战工作流、持续学习习惯与思维升级。",
        "/courses/ai-digital-literacy/07-tools/ai_base_module7.mp4"
      ),
      lesson(
        8,
        "模块 8：课程总结与未来展望",
        7,
        "2:47",
        "七大核心能力思维导图回顾、三条进阶路径（AI电商/办公效率/创作者）、持续学习三个习惯、个人30天学习计划制定。",
        "/courses/ai-digital-literacy/08-zongjie/ai_base_module8.mp4"
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

/* 会员定价 */
export const MEMBERSHIP_PRICE = 6888;

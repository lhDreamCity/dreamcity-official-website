"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { courses } from "@/app/lib/data";

/* ================================================================
   课程图鉴 —— Obsidian 风格的课程关系图谱 + 推荐学习路径
   ================================================================ */

const PATH_STEPS = [
  {
    step: 1,
    courseSlug: "ai-digital-literacy",
    title: "先修：AI 时代个人数字素养基础课",
    desc: "看懂国内 AI 生态、把 AI 嵌入办公与知识管理、理解技术架构与提示词进阶，从工具使用者进阶为 AI 工作流设计师。",
    reason: "前置必修",
    skills: ["数字素养", "AI工作流", "工具选型"],
  },
  {
    step: 2,
    courseSlug: "ai-opc",
    title: "进阶：AI 时代个人品牌搭建",
    desc: "学习定位、内容生产、平台运营与私域变现，建立可信任的个人影响力资产。",
    reason: "能力放大",
    skills: ["个人定位", "内容生产", "私域运营"],
  },
  {
    step: 3,
    courseSlug: "ai-ecommerce",
    title: "实战：AI 个人电商实战",
    desc: "用 AI 跑通选品、上架、内容营销到出单的完整电商闭环，实现商业变现。",
    reason: "商业闭环",
    skills: ["AI选品", "内容营销", "订单履约"],
  },
];

export default function CourseAtlas() {
  const [open, setOpen] = useState(false);

  return (
    <section className="section !py-14">
      <div className="container-page">
        {/* 下拉触发按钮 */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between rounded-2xl border border-line bg-white px-8 py-6 text-left transition-shadow hover:shadow-lg"
        >
          <div>
            <h2 className="text-xl font-bold text-ink">
              <span className="mr-2">🗺️</span>
              课程图鉴 & 学习路径
            </h2>
            <p className="mt-1 text-[14px] text-muted">
              查看三门课程的能力关联与推荐学习顺序
            </p>
          </div>
          <span
            className={`text-2xl text-gold transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          >
            ▼
          </span>
        </button>

        {/* 下拉展开内容 */}
        <div
          className={`grid transition-all duration-500 ease-in-out ${open ? "mt-6 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
        >
          <div className="overflow-hidden">
            <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
              {/* 左侧：关系图谱 */}
              <div className="card p-8">
                <h3 className="mb-6 text-lg font-bold text-ink">
                  课程能力关联图谱
                </h3>
                <CourseGraph />
              </div>

              {/* 右侧：推荐学习路径 */}
              <div className="card p-8">
                <h3 className="mb-6 text-lg font-bold text-ink">
                  推荐学习路径
                </h3>
                <div className="relative space-y-6">
                  {/* 竖线 */}
                  <div className="absolute left-[19px] top-3 h-[calc(100%-24px)] w-[2px] bg-gradient-to-b from-gold via-gold-soft to-transparent" />

                  {PATH_STEPS.map((s) => {
                    const course = courses.find((c) => c.slug === s.courseSlug);
                    return (
                      <div key={s.step} className="relative flex gap-4">
                        <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold text-[13px] font-bold text-brand-dark shadow-md">
                          {s.step}
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[15px] font-bold text-ink">
                              {s.title}
                            </span>
                            <span className="rounded-full bg-gold-soft px-2 py-0.5 text-[11px] font-bold text-gold">
                              {s.reason}
                            </span>
                          </div>
                          <p className="mt-1 text-[13px] leading-relaxed text-muted">
                            {s.desc}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {s.skills.map((skill) => (
                              <span
                                key={skill}
                                className="rounded-md bg-bg px-2 py-0.5 text-[12px] text-ink-soft"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                          {course && (
                            <Link
                              href={`/courses/${course.slug}`}
                              className="btn btn-primary mt-3 !py-2 !text-[12px]"
                            >
                              查看课程
                            </Link>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 底部：速查卡片 */}
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {courses.map((c) => (
                <Link
                  key={c.slug}
                  href={`/courses/${c.slug}`}
                  className="group card overflow-hidden p-0"
                >
                  <div className="relative h-32 w-full overflow-hidden">
                    <Image
                      src={c.cover}
                      alt={c.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand/80 to-transparent" />
                    <span className="absolute bottom-3 left-4 text-lg font-bold text-white">
                      {c.title}
                    </span>
                  </div>
                  <div className="p-5">
                    <p className="text-[13px] leading-relaxed text-muted">
                      {c.subtitle}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-full bg-gold-soft px-2 py-0.5 text-[11px] font-bold text-gold">
                        {c.level}
                      </span>
                      <span className="rounded-full bg-bg px-2 py-0.5 text-[11px] text-muted">
                        {c.lessons.length} 课时
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================================================================
   SVG 关系图组件
   ================================================================ */
function CourseGraph() {
  const nodeRadius = 34;
  const centerX = 220;
  const centerY = 140;
  const orbitR = 105;

  const nodes = [
    {
      slug: "ai-digital-literacy",
      label: "数字基础",
      sub: "前置课",
      x: centerX,
      y: centerY - orbitR,
      color: "#d4af37",
      fill: "#f7e7b5",
    },
    {
      slug: "ai-opc",
      label: "个人品牌",
      sub: "进阶课",
      x: centerX - orbitR * 0.866,
      y: centerY + orbitR * 0.5,
      color: "#0a2540",
      fill: "#e8eef7",
    },
    {
      slug: "ai-ecommerce",
      label: "个人电商",
      sub: "实战课",
      x: centerX + orbitR * 0.866,
      y: centerY + orbitR * 0.5,
      color: "#0a2540",
      fill: "#e8eef7",
    },
  ];

  const centerNode = {
    label: "AI赋能",
    sub: "核心",
    x: centerX,
    y: centerY,
    color: "#fff",
    fill: "#0a2540",
  };

  return (
    <svg viewBox="0 0 440 280" className="w-full">
      <defs>
        <marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 L2,4 Z" fill="#d4af37" />
        </marker>
      </defs>

      {/* 连线：中心 → 各课程 */}
      {nodes.map((n) => (
        <line
          key={n.slug}
          x1={centerNode.x}
          y1={centerNode.y}
          x2={n.x}
          y2={n.y}
          stroke="rgba(10,37,64,0.15)"
          strokeWidth={2}
          strokeDasharray="4 4"
        />
      ))}

      {/* 连线：数字基础 → 个人品牌 → 个人电商（学习路径） */}
      <path
        d={`M ${nodes[0].x} ${nodes[0].y + nodeRadius} Q ${centerX - 40} ${centerY + orbitR + 20} ${nodes[1].x + nodeRadius} ${nodes[1].y}`}
        fill="none"
        stroke="#d4af37"
        strokeWidth={2}
        markerEnd="url(#arrow)"
      />
      <path
        d={`M ${nodes[1].x} ${nodes[1].y + nodeRadius} Q ${centerX} ${centerY + orbitR + 40} ${nodes[2].x - nodeRadius} ${nodes[2].y}`}
        fill="none"
        stroke="#d4af37"
        strokeWidth={2}
        markerEnd="url(#arrow)"
      />

      {/* 中心节点 */}
      <g>
        <circle
          cx={centerNode.x}
          cy={centerNode.y}
          r={nodeRadius}
          fill={centerNode.fill}
        />
        <text
          x={centerNode.x}
          y={centerNode.y - 4}
          textAnchor="middle"
          fill={centerNode.color}
          fontSize={13}
          fontWeight={700}
        >
          {centerNode.label}
        </text>
        <text
          x={centerNode.x}
          y={centerNode.y + 12}
          textAnchor="middle"
          fill="rgba(255,255,255,0.7)"
          fontSize={10}
        >
          {centerNode.sub}
        </text>
      </g>

      {/* 课程节点 */}
      {nodes.map((n) => (
        <g key={n.slug}>
          <circle
            cx={n.x}
            cy={n.y}
            r={nodeRadius}
            fill={n.fill}
            stroke={n.color}
            strokeWidth={2}
          />
          <text
            x={n.x}
            y={n.y - 4}
            textAnchor="middle"
            fill={n.color}
            fontSize={12}
            fontWeight={700}
          >
            {n.label}
          </text>
          <text
            x={n.x}
            y={n.y + 12}
            textAnchor="middle"
            fill="#5b6b85"
            fontSize={10}
          >
            {n.sub}
          </text>
        </g>
      ))}

      {/* 图例 */}
      <g transform="translate(20, 245)">
        <line x1={0} y1={6} x2={24} y2={6} stroke="#d4af37" strokeWidth={2} markerEnd="url(#arrow)" />
        <text x={32} y={10} fill="#5b6b85" fontSize={11}>推荐学习顺序</text>
        <line x1={140} y1={6} x2={164} y2={6} stroke="rgba(10,37,64,0.15)" strokeWidth={2} strokeDasharray="4 4" />
        <text x={172} y={10} fill="#5b6b85" fontSize={11}>能力关联</text>
      </g>
    </svg>
  );
}

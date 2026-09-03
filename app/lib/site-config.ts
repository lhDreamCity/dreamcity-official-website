/**
 * 单站点的公司信息
 *
 * Footer / About / Contact 三处展示的邮箱、电话、公司名都引用这里，
 * 改一处全站同步。
 */

export const SITE = {
  name: "梦之城AI赋能中心",
  company: "深圳领航梦之城科技有限公司",
  address: "深圳市南山区南头街道豪方天际广场4006",
  email: "zhanghao1@lhdreamcity.cn",
  phone: "13521762755",
  url: "https://dreamcity.ai",
  logo: "/avator.png",
} as const;

export const CONTACT = {
  /** 公开联系邮箱（站点底部 / 联系我们页使用） */
  email: SITE.email,
  /** 联系电话。手机号展示了就不便改，先沿用公司联系人号码。 */
  phone: SITE.phone,
  /** 联系页面 / 业务咨询的统一说明文本 */
  note: "如需商务合作、课程咨询或企业定制培训，欢迎通过上方联系方式与我们取得联系。",
} as const;
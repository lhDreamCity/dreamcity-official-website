/**
 * 短信下发接口 + dev mock。
 *
 * 设计：
 *   - 真实环境接阿里云 / 腾讯云：实现一个 send(phone, code) 调用 HTTP API
 *   - dev 环境：console.log 出来，前端用其他渠道（dev peek 接口）拿
 *   - 永远不在 API 响应里返回 code
 *
 * M2 阶段：devMock 是唯一实现。生产实现留 TODO。
 */

export interface SmsProvider {
  /** 发送验证码。返回是否成功（不抛异常表示 false，方便上层区分错误）。 */
  send(phone: string, code: string): Promise<{ ok: boolean; error?: string }>;
}

class DevSmsProvider implements SmsProvider {
  async send(phone: string, code: string): Promise<{ ok: boolean }> {
    // 注意：这里打到 stderr，跟真实生产日志区分（生产实现走专门 channel）
    console.error(`[sms:dev] -> ${phone}: ${code}`);
    return { ok: true };
  }
}

let _provider: SmsProvider | null = null;

export function smsProvider(): SmsProvider {
  if (!_provider) _provider = new DevSmsProvider();
  return _provider;
}

/** 测试时可注入 mock 覆盖。 */
export function __setSmsProviderForTest(p: SmsProvider | null): void {
  _provider = p;
}
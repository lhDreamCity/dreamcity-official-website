/**
 * ULID 生成。统一从这一处出，方便日后换成 UUIDv7 或其他格式。
 *
 * ULID 是 26 字符 base32（Crockford），可按时间排序，比 UUID 短；
 *  在 URL / cookie / DB primary key 里都好读。
 */

import { ulid as makeUlid } from "ulid";

export function newId(): string {
  return makeUlid();
}

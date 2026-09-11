import { and, eq } from "drizzle-orm";
import { db, schema } from "../client";
import { newId } from "../../ulid";
import { identifierHash, type IdentityType } from "../../identifier-hash";

const { identities } = schema;

export async function createIdentity(input: {
  userId: string;
  type: IdentityType;
  identifier: string;
  verified?: boolean;
}): Promise<schema.Identity> {
  const now = Date.now();
  const i: schema.NewIdentity = {
    id: newId(),
    userId: input.userId,
    type: input.type,
    identifier: input.identifier, // M2 暂存原文；M5 切到 AES-GCM 加密
    identifierHash: identifierHash(input.type, input.identifier),
    verifiedAt: input.verified ? now : null,
    createdAt: now,
  };
  await db.insert(identities).values(i);
  return (
    await db.select().from(identities).where(eq(identities.id, i.id))
  )[0]!;
}

export async function findIdentityByHash(
  type: IdentityType,
  identifier: string,
): Promise<schema.Identity | null> {
  const hash = identifierHash(type, identifier);
  const rows = await db
    .select()
    .from(identities)
    .where(and(eq(identities.type, type), eq(identities.identifierHash, hash)));
  return rows[0] ?? null;
}

export async function listIdentitiesForUser(userId: string): Promise<schema.Identity[]> {
  return db.select().from(identities).where(eq(identities.userId, userId));
}

export async function markIdentityVerified(id: string): Promise<void> {
  await db
    .update(identities)
    .set({ verifiedAt: Date.now() })
    .where(eq(identities.id, id));
}
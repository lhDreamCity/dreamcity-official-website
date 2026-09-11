import { and, eq } from "drizzle-orm";
import { db, schema } from "../client";

const { userRoles } = schema;

export type RoleName = "admin" | "teacher" | "editor" | "member";

export async function grantRole(input: {
  userId: string;
  role: RoleName;
  grantedBy?: string | null;
}): Promise<void> {
  await db
    .insert(userRoles)
    .values({
      userId: input.userId,
      role: input.role,
      grantedBy: input.grantedBy ?? null,
      grantedAt: Date.now(),
    })
    .onConflictDoNothing();
}

export async function revokeRole(userId: string, role: RoleName): Promise<void> {
  await db
    .delete(userRoles)
    .where(and(eq(userRoles.userId, userId), eq(userRoles.role, role)));
}

export async function listRolesForUser(userId: string): Promise<RoleName[]> {
  const rows = await db
    .select({ role: userRoles.role })
    .from(userRoles)
    .where(eq(userRoles.userId, userId));
  return rows.map((r) => r.role as RoleName);
}
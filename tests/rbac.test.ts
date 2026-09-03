/**
 * Smoke tests for RBAC primitives.
 *
 * Run with: `npm test` (uses Node 24's built-in strip-types loader).
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  ROLE_PERMISSIONS,
  hasAnyRole,
  hasPermission,
  hasRole,
  resolvePermissions,
} from "../app/lib/rbac.ts";

test("admin role grants every declared permission", () => {
  const all = resolvePermissions(["admin"]);
  for (const perm of Object.values(ROLE_PERMISSIONS).flatMap((p) => p)) {
    assert.ok(all.includes(perm), `admin should have ${perm}`);
  }
});

test("guest only has course:view", () => {
  const perms = resolvePermissions(["guest"]);
  assert.deepEqual(perms, ["course:view"]);
});

test("member can watch lessons", () => {
  const perms = resolvePermissions(["member"]);
  assert.ok(hasPermission(perms, "lesson:watch"));
  assert.ok(!hasPermission(perms, "course:create"));
});

test("teacher has content:publish and analysis:view", () => {
  const perms = resolvePermissions(["teacher"]);
  assert.ok(hasPermission(perms, "content:publish"));
  assert.ok(hasPermission(perms, "analysis:view"));
  assert.ok(!hasPermission(perms, "user:manage"));
});

test("resolvePermissions unions multi-role permissions without duplicates", () => {
  const perms = resolvePermissions(["member", "editor"]);
  const deduped = Array.from(new Set(perms));
  assert.equal(perms.length, deduped.length, "no duplicates");
  assert.ok(hasPermission(perms, "content:publish"), "editor grants publish");
  assert.ok(hasPermission(perms, "lesson:watch"), "member grants watch");
});

test("hasRole and hasAnyRole are simple membership checks", () => {
  assert.ok(hasRole(["admin"], "admin"));
  assert.ok(!hasRole(["member"], "admin"));
  assert.ok(hasAnyRole(["teacher", "member"], ["admin", "teacher"]));
  assert.ok(!hasAnyRole(["guest"], ["admin", "teacher", "editor"]));
});

test("hasPermission reflects the input list, not the role map", () => {
  // Passing in an empty array means no permissions.
  assert.ok(!hasPermission([], "course:view"));
});
import { loadAdminUsers } from "@/app/lib/admin-data";
import UsersTable from "./_table";

export default async function AdminUsersPage() {
  const users = await loadAdminUsers();
  return <UsersTable users={users} />;
}

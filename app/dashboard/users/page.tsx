import { Metadata } from "next";
import UsersTable from "@/app/ui/users/table";
import { fetchUsers } from "@/app/lib/data";

export const metadata: Metadata = {
  title: "Users",
};

export default async function Page(props: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || "";
  const users = await fetchUsers(query);
  return <UsersTable users={users} />;
}

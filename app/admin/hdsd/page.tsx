import { getAdminHDSDArticles } from "@/actions/hdsd";
import AdminHDSDEditor from "@/components/admin/AdminHDSDEditor";

export default async function AdminHDSDPage() {
  const result = await getAdminHDSDArticles();

  return (
    <AdminHDSDEditor initialArticles={result.success && result.data ? result.data : []} />
  );
}


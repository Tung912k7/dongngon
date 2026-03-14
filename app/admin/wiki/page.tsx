import { getAdminWikiArticles } from "@/actions/wiki";
import AdminWikiEditor from "@/components/admin/AdminWikiEditor";

export default async function AdminWikiPage() {
  const result = await getAdminWikiArticles();

  return (
    <AdminWikiEditor initialArticles={result.success ? result.data : []} />
  );
}

import { notFound } from "next/navigation";
import PageForm from "@/components/admin/PageForm";
import { getPageById } from "@/lib/models/pages";

export default function EditPagePage({ params }: { params: { id: string } }) {
  const page = getPageById(params.id);
  if (!page) notFound();
  return (
    <div>
      <h1 className="mb-6 text-2xl font-black text-ink">ویرایش صفحه: {page.title}</h1>
      <PageForm page={page} />
    </div>
  );
}

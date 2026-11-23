import { notFound } from "next/navigation";
import NewsForm from "@/components/admin/NewsForm";
import { getNewsById } from "@/lib/models/news";

export default function EditNewsPage({ params }: { params: { id: string } }) {
  const item = getNewsById(params.id);
  if (!item) notFound();
  return (
    <div>
      <h1 className="mb-6 text-2xl font-black text-ink">ویرایش: {item.title}</h1>
      <NewsForm item={item} />
    </div>
  );
}

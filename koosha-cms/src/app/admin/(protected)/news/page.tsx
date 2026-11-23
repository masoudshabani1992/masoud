import Link from "next/link";
import { listNews } from "@/lib/models/news";
import DeleteButton from "@/components/admin/DeleteButton";
import { formatJalaliDate } from "@/lib/utils";

export default function AdminNewsPage() {
  const items = listNews();
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-black text-ink">اخبار و بخشنامه‌ها</h1>
        <Link href="/admin/news/new" className="admin-btn">+ خبر / بخشنامه جدید</Link>
      </div>

      <div className="admin-card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-right text-ink/50">
              <th className="p-4">عنوان</th>
              <th className="p-4">نوع</th>
              <th className="p-4">تاریخ</th>
              <th className="p-4">وضعیت</th>
              <th className="p-4">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {items.map((n) => (
              <tr key={n.id} className="border-b border-line last:border-0">
                <td className="max-w-xs p-4 font-bold text-ink">{n.title}</td>
                <td className="p-4">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${n.type === "CIRCULAR" ? "bg-smoke text-ink" : "bg-ink text-white"}`}>
                    {n.type === "CIRCULAR" ? "بخشنامه" : "خبر"}
                  </span>
                </td>
                <td className="p-4 text-ink/60">{formatJalaliDate(n.publishedAt)}</td>
                <td className="p-4">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${n.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {n.isActive ? "فعال" : "غیرفعال"}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <Link href={`/admin/news/${n.id}`} className="admin-btn-outline">ویرایش</Link>
                    <DeleteButton url={`/api/admin/news/${n.id}`} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && <p className="p-10 text-center text-ink/40">موردی ثبت نشده است.</p>}
      </div>
    </div>
  );
}

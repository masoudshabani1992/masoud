import Link from "next/link";
import { listPages } from "@/lib/models/pages";
import DeleteButton from "@/components/admin/DeleteButton";

export default function AdminPagesList() {
  const pages = listPages();
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-black text-ink">صفحات</h1>
        <Link href="/admin/pages/new" className="admin-btn">+ صفحه جدید</Link>
      </div>

      <div className="admin-card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-right text-ink/50">
              <th className="p-4">عنوان</th>
              <th className="p-4">آدرس</th>
              <th className="p-4">در منو</th>
              <th className="p-4">وضعیت</th>
              <th className="p-4">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {pages.map((p) => (
              <tr key={p.id} className="border-b border-line last:border-0">
                <td className="p-4 font-bold text-ink">{p.title}</td>
                <td className="p-4 text-ink/50" dir="ltr">/{p.slug}</td>
                <td className="p-4 text-ink/60">{p.showInMenu ? "بله" : "خیر"}</td>
                <td className="p-4">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${p.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {p.isActive ? "فعال" : "غیرفعال"}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <Link href={`/admin/pages/${p.id}`} className="admin-btn-outline">ویرایش</Link>
                    <DeleteButton url={`/api/admin/pages/${p.id}`} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {pages.length === 0 && <p className="p-10 text-center text-ink/40">صفحه‌ای ثبت نشده است.</p>}
      </div>
    </div>
  );
}

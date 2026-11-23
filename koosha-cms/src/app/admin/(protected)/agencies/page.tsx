import Link from "next/link";
import { listAgencies } from "@/lib/models/agencies";
import DeleteButton from "@/components/admin/DeleteButton";

export default function AdminAgenciesPage() {
  const agencies = listAgencies();
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-black text-ink">عاملیت‌ها و نمایندگی‌ها</h1>
        <Link href="/admin/agencies/new" className="admin-btn">+ عاملیت جدید</Link>
      </div>

      <div className="admin-card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-right text-ink/50">
              <th className="p-4">شهر</th>
              <th className="p-4">نام عاملیت</th>
              <th className="p-4">تلفن</th>
              <th className="p-4">وضعیت</th>
              <th className="p-4">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {agencies.map((a) => (
              <tr key={a.id} className="border-b border-line last:border-0">
                <td className="p-4 font-bold text-ink">{a.city}</td>
                <td className="p-4 text-ink/70">{a.name}</td>
                <td className="p-4 text-ink/60" dir="ltr">{a.phone}</td>
                <td className="p-4">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${a.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {a.isActive ? "فعال" : "غیرفعال"}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <Link href={`/admin/agencies/${a.id}`} className="admin-btn-outline">ویرایش</Link>
                    <DeleteButton url={`/api/admin/agencies/${a.id}`} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {agencies.length === 0 && <p className="p-10 text-center text-ink/40">عاملیتی ثبت نشده است.</p>}
      </div>
    </div>
  );
}

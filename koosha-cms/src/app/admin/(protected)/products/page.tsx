import Link from "next/link";
import { listProducts } from "@/lib/models/products";
import DeleteButton from "@/components/admin/DeleteButton";

export default function AdminProductsPage() {
  const products = listProducts();
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-black text-ink">محصولات</h1>
        <Link href="/admin/products/new" className="admin-btn">+ محصول جدید</Link>
      </div>

      <div className="admin-card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-right text-ink/50">
              <th className="p-4">تصویر</th>
              <th className="p-4">نام</th>
              <th className="p-4">دسته‌بندی</th>
              <th className="p-4">وضعیت</th>
              <th className="p-4">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-line last:border-0">
                <td className="p-4">
                  {p.imageUrl ? (
                    <img src={p.imageUrl} className="h-12 w-16 rounded object-cover" alt="" />
                  ) : (
                    <div className="h-12 w-16 rounded bg-smoke" />
                  )}
                </td>
                <td className="p-4 font-bold text-ink">{p.name}</td>
                <td className="p-4 text-ink/60">{p.category}</td>
                <td className="p-4">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${p.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {p.isActive ? "فعال" : "غیرفعال"}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <Link href={`/admin/products/${p.id}`} className="admin-btn-outline">ویرایش</Link>
                    <DeleteButton url={`/api/admin/products/${p.id}`} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && <p className="p-10 text-center text-ink/40">محصولی ثبت نشده است.</p>}
      </div>
    </div>
  );
}

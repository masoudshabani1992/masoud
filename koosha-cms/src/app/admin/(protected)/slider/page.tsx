import Link from "next/link";
import { listSlides } from "@/lib/models/slider";
import DeleteButton from "@/components/admin/DeleteButton";

export default function AdminSliderPage() {
  const slides = listSlides();
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-black text-ink">اسلایدر صفحه اول</h1>
        <Link href="/admin/slider/new" className="admin-btn">+ اسلاید جدید</Link>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {slides.map((s) => (
          <div key={s.id} className="admin-card overflow-hidden p-0">
            <div className="aspect-video w-full bg-smoke">
              {s.imageUrl && <img src={s.imageUrl} alt={s.title} className="h-full w-full object-cover" />}
            </div>
            <div className="p-5">
              <div className="mb-1 flex items-center justify-between">
                <h3 className="font-black text-ink">{s.title}</h3>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${s.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  {s.isActive ? "فعال" : "غیرفعال"}
                </span>
              </div>
              <p className="mb-4 line-clamp-1 text-sm text-ink/60">{s.subtitle}</p>
              <div className="flex gap-2">
                <Link href={`/admin/slider/${s.id}`} className="admin-btn-outline">ویرایش</Link>
                <DeleteButton url={`/api/admin/slider/${s.id}`} />
              </div>
            </div>
          </div>
        ))}
      </div>
      {slides.length === 0 && <p className="p-10 text-center text-ink/40">اسلایدی ثبت نشده است.</p>}
    </div>
  );
}

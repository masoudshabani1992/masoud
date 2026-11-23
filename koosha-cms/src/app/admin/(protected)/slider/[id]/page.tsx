import { notFound } from "next/navigation";
import SlideForm from "@/components/admin/SlideForm";
import { getSlideById } from "@/lib/models/slider";

export default function EditSlidePage({ params }: { params: { id: string } }) {
  const slide = getSlideById(params.id);
  if (!slide) notFound();
  return (
    <div>
      <h1 className="mb-6 text-2xl font-black text-ink">ویرایش اسلاید: {slide.title}</h1>
      <SlideForm slide={slide} />
    </div>
  );
}

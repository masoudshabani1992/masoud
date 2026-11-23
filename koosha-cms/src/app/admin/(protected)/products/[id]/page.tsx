import { notFound } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";
import { getProductById } from "@/lib/models/products";

export default function EditProductPage({ params }: { params: { id: string } }) {
  const product = getProductById(params.id);
  if (!product) notFound();
  return (
    <div>
      <h1 className="mb-6 text-2xl font-black text-ink">ویرایش محصول: {product.name}</h1>
      <ProductForm product={product} />
    </div>
  );
}

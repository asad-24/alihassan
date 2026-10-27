import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { collections } from "@/lib/db";
import { ProductForm } from "@/components/admin/product-form";
export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const product = await (
    await collections()
  ).products.findOne({ _id: (await params).id });
  if (!product) notFound();
  return <ProductForm product={product} />;
}

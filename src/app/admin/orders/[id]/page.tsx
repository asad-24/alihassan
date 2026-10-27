import { OrderManager } from "@/components/admin/order-manager";
export default async function AdminOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <OrderManager id={(await params).id} />;
}

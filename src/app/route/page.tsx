import CustomerRouteClient from "@/components/customer-route-client";
import { interactions, products } from "@/lib/data";

export default function RoutePage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Customer Route</h2>
      </div>
      <CustomerRouteClient interactions={interactions} products={products} />
    </div>
  );
}

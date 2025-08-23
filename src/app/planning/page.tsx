
import CustomerRouteClient from "@/components/customer-route-client";
import { List, Map } from "lucide-react";

export default function PlanningPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Monthly Planning</h2>
      </div>
      <CustomerRouteClient mode="route" />
    </div>
  );
}

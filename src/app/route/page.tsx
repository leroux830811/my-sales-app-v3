import CustomerRouteClient from "@/components/customer-route-client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { List, Map } from "lucide-react";

export default function RoutePage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Start Call</h2>
      </div>
      <Tabs defaultValue="route">
        <TabsList className="grid w-full grid-cols-2 md:w-1/2">
            <TabsTrigger value="route"><Map className="mr-2"/>My Route</TabsTrigger>
            <TabsTrigger value="all"><List className="mr-2"/>Log a Call</TabsTrigger>
        </TabsList>
        <TabsContent value="route">
            <CustomerRouteClient mode="route" />
        </TabsContent>
         <TabsContent value="all">
            <CustomerRouteClient mode="all" />
        </TabsContent>
      </Tabs>
    </div>
  );
}

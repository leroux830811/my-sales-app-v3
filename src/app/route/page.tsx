import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RoutePage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Customer Route</h2>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Route Planner</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This page will display a map with your customers' locations to help you plan your daily routes. You'll be able to view customer details, add notes, and place orders directly from the map.
          </p>
          <div className="mt-4 h-96 w-full bg-muted rounded-md flex items-center justify-center">
            <p className="text-muted-foreground">Map will be implemented here.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

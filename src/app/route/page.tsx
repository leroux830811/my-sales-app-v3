
"use client";

import React from "react";
import CustomerRouteClient from "@/components/customer-route-client";


export default function RoutePage() {

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <CustomerRouteClient mode="route" />
    </div>
  );
}

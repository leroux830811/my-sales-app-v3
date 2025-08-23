
"use client";

import React, { useState, useEffect } from "react";
import CustomerRouteClient from "@/components/customer-route-client";
import { useRoute } from "@/context/route-context";
import { useCustomers } from "@/context/customer-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"


export default function RoutePage() {
  const { getTodaysRoute } = useRoute();
  const { customers } = useCustomers();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);


  const todaysRouteIds = getTodaysRoute();
  const todaysCustomers = customers.filter(c => todaysRouteIds.includes(c.id));

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div className="flex items-center gap-4">
            <h2 className="text-3xl font-bold tracking-tight">Start Call</h2>
            {isClient && todaysCustomers.length > 0 && (
                 <TooltipProvider>
                    <div className="flex items-center -space-x-2">
                        {todaysCustomers.map(customer => (
                             <Tooltip key={customer.id}>
                                <TooltipTrigger asChild>
                                     <Avatar className="border-2 border-background">
                                        <AvatarImage src={`https://placehold.co/40x40.png?text=${customer.name.charAt(0)}`} />
                                        <AvatarFallback>{customer.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{customer.name}</p>
                                </TooltipContent>
                             </Tooltip>
                        ))}
                    </div>
                </TooltipProvider>
            )}
        </div>
      </div>
      <CustomerRouteClient mode="route" />
    </div>
  );
}

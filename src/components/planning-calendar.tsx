
"use client";

import React from 'react';
import { Calendar } from "@/components/ui/calendar";
import { useRoute } from '@/context/route-context';
import { Card, CardContent } from './ui/card';
import { format } from 'date-fns';
import { useCustomers } from '@/context/customer-context';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import { PlusCircle, X, Search } from 'lucide-react';
import { Separator } from './ui/separator';
import { Input } from './ui/input';

export function PlanningCalendar() {
    const { plannedRoutes, addCustomerToDate, removeCustomerFromDate, getRouteForDate } = useRoute();
    const { customers } = useCustomers();
    const [date, setDate] = React.useState<Date | undefined>(new Date());
    const [searchTerm, setSearchTerm] = React.useState("");

    const selectedDate = date || new Date();
    const customersForSelectedDate = getRouteForDate(selectedDate);

    const customersOnRoute = customers.filter(c => customersForSelectedDate.includes(c.id));
    
    const customersNotOnRoute = customers
        .filter(c => !customersForSelectedDate.includes(c.id))
        .filter(c => 
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            c.town.toLowerCase().includes(searchTerm.toLowerCase())
        );
    
    return (
        <Card className="h-full flex flex-col">
            <CardContent className="flex-1 flex flex-col md:flex-row gap-6 p-4">
                <div className="flex-1 md:border-r md:pr-6">
                     <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        className="rounded-md"
                        classNames={{
                            day: "h-12 w-12 text-base",
                            head_cell: "w-12",
                        }}
                        components={{
                            DayContent: ({ date, ...props }) => {
                                const dateStr = format(date, 'yyyy-MM-dd');
                                const dayRoute = plannedRoutes[dateStr];
                                return (
                                    <div className="relative h-full w-full flex items-center justify-center">
                                        <span>{format(date, 'd')}</span>
                                        {dayRoute && dayRoute.length > 0 && (
                                             <div className="absolute bottom-1 w-2 h-2 rounded-full bg-primary" />
                                        )}
                                    </div>
                                );
                            },
                        }}
                    />
                </div>
                <div className="md:w-2/3 flex-1 flex flex-col">
                    <h3 className="text-lg font-semibold mb-4">
                        Plan for {format(selectedDate, "MMMM do, yyyy")}
                    </h3>
                    <div className="grid grid-cols-2 gap-6 flex-1">
                        <div className="flex flex-col">
                           <h4 className="font-medium mb-2">On Route ({customersOnRoute.length})</h4>
                            <ScrollArea className="flex-1 -mr-4">
                                <div className='pr-4 space-y-2'>
                                {customersOnRoute.length > 0 ? (
                                    customersOnRoute.map(customer => (
                                    <div key={customer.id} className="p-2 rounded-md bg-muted flex items-center justify-between">
                                        <p className="font-medium text-sm">{customer.name}</p>
                                        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => removeCustomerFromDate(customer.id, selectedDate)}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))
                                ) : (
                                    <p className="text-muted-foreground text-sm text-center pt-8">No customers planned for this day.</p>
                                )}
                                </div>
                           </ScrollArea>
                        </div>
                        <div className='flex flex-col'>
                            <div className="relative mb-2">
                                 <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                 <Input 
                                    type="search"
                                    placeholder="Search by name or town..."
                                    className="w-full pl-8 h-9"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                 />
                            </div>
                            <ScrollArea className="flex-1 -mr-4">
                                <div className='pr-4 space-y-2'>
                                    {customersNotOnRoute.map(customer => (
                                        <div key={customer.id} className="p-2 rounded-md border flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-sm">{customer.name}</p>
                                                <p className="text-xs text-muted-foreground">{customer.town}</p>
                                            </div>
                                            <Button size="icon" variant="outline" className="h-6 w-6" onClick={() => addCustomerToDate(customer.id, selectedDate)}>
                                                <PlusCircle className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

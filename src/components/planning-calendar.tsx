
"use client";

import React from 'react';
import { Calendar } from "@/components/ui/calendar";
import { useReminders } from '@/context/reminder-context';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { format } from 'date-fns';
import { useCustomers } from '@/context/customer-context';

export function PlanningCalendar() {
    const { reminders } = useReminders();
    const { customers } = useCustomers();
    const [date, setDate] = React.useState<Date | undefined>(new Date());

    const remindersByDate = reminders.reduce((acc, reminder) => {
        const dateStr = format(new Date(reminder.date), 'yyyy-MM-dd');
        if (!acc[dateStr]) {
            acc[dateStr] = [];
        }
        acc[dateStr].push(reminder);
        return acc;
    }, {} as Record<string, typeof reminders>);

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
                                const dayReminders = remindersByDate[dateStr];
                                return (
                                    <div className="relative h-full w-full flex items-center justify-center">
                                        <span>{format(date, 'd')}</span>
                                        {dayReminders && (
                                             <div className="absolute bottom-1 w-2 h-2 rounded-full bg-primary" />
                                        )}
                                    </div>
                                );
                            },
                        }}
                    />
                </div>
                <div className="md:w-1/3 flex-1">
                    <h3 className="text-lg font-semibold mb-4">
                        {date ? format(date, "MMMM do, yyyy") : "Select a date"}
                    </h3>
                    <div className="space-y-4">
                        {date && remindersByDate[format(date, 'yyyy-MM-dd')] ? (
                            remindersByDate[format(date, 'yyyy-MM-dd')].map(reminder => {
                                const customer = reminder.customerId ? customers.find(c => c.id === reminder.customerId) : null;
                                return (
                                    <div key={reminder.id} className="p-3 rounded-md bg-muted">
                                        <Badge className='mb-2'>{customer ? 'Customer' : 'General'}</Badge>
                                        <p className="font-medium">{reminder.notes}</p>
                                        {customer && <p className="text-sm text-muted-foreground">{customer.name}</p>}
                                    </div>
                                )
                            })
                        ) : (
                            <p className="text-muted-foreground text-sm">No reminders for this date.</p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

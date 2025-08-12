"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Calendar as CalendarIcon, PlusCircle, Check, ChevronsUpDown } from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { useReminders } from '@/context/reminder-context';
import { useCustomers } from '@/context/customer-context';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

export default function RemindersPage() {
  const { reminders, addReminder, toggleReminderComplete } = useReminders();
  const { customers } = useCustomers();
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [isCustomerPopoverOpen, setIsCustomerPopoverOpen] = useState(false);
  
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | undefined>(undefined);
  const [reminderDate, setReminderDate] = useState<Date | undefined>(new Date());
  const [reminderNotes, setReminderNotes] = useState("");
  const [reminderType, setReminderType] = useState<'customer' | 'general'>('customer');

  const handleSaveReminder = () => {
    if (!reminderDate || !reminderNotes.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide a date and notes for the reminder.",
        variant: "destructive"
      });
      return;
    }
    if (reminderType === 'customer' && !selectedCustomerId) {
       toast({
        title: "Missing Information",
        description: "Please select a customer for the reminder.",
        variant: "destructive"
      });
      return;
    }

    addReminder({
      customerId: reminderType === 'customer' ? selectedCustomerId : undefined,
      date: reminderDate.toISOString(),
      notes: reminderNotes,
      isComplete: false,
    });
    
    toast({ title: "Reminder Saved!" });
    setDialogOpen(false);
    setSelectedCustomerId(undefined);
    setReminderDate(new Date());
    setReminderNotes("");
  };

  const customerReminders = reminders.filter(r => r.customerId && !r.isComplete);
  const generalReminders = reminders.filter(r => !r.customerId && !r.isComplete);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Reminders</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Reminder
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Reminder</DialogTitle>
              <DialogDescription>
                Set a reminder for a customer follow-up or a general task.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
               <Tabs defaultValue="customer" onValueChange={(value) => setReminderType(value as 'customer' | 'general')}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="customer">For a Customer</TabsTrigger>
                    <TabsTrigger value="general">General</TabsTrigger>
                  </TabsList>
              </Tabs>
              
              {reminderType === 'customer' && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="customer" className="text-right">
                    Customer
                  </Label>
                  <div className='col-span-3'>
                    <Popover open={isCustomerPopoverOpen} onOpenChange={setIsCustomerPopoverOpen}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" role="combobox" className="w-full justify-between">
                          {selectedCustomerId ? customers.find(c => c.id === selectedCustomerId)?.name : "Select customer..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                         <Command>
                            <CommandInput placeholder="Search customer..." />
                            <CommandList>
                                <CommandEmpty>No customer found.</CommandEmpty>
                                <CommandGroup>
                                    {customers.map(customer => (
                                    <CommandItem
                                        key={customer.id}
                                        value={customer.name}
                                        onSelect={() => {
                                            setSelectedCustomerId(customer.id);
                                            setIsCustomerPopoverOpen(false);
                                        }}
                                    >
                                        <Check className={cn("mr-2 h-4 w-4", selectedCustomerId === customer.id ? "opacity-100" : "opacity-0")}/>
                                        {customer.name}
                                    </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right">
                  Date
                </Label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                        variant={"outline"}
                        className={cn(
                            "w-full justify-start text-left font-normal col-span-3",
                            !reminderDate && "text-muted-foreground"
                        )}
                        >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {reminderDate ? format(reminderDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar
                        mode="single"
                        selected={reminderDate}
                        onSelect={setReminderDate}
                        initialFocus
                        />
                    </PopoverContent>
                </Popover>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="notes" className="text-right">
                  Notes
                </Label>
                <Textarea id="notes" className="col-span-3" placeholder="Follow up on..." value={reminderNotes} onChange={e => setReminderNotes(e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSaveReminder}>Save Reminder</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

       <Tabs defaultValue="customer">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="customer">Customer Reminders ({customerReminders.length})</TabsTrigger>
            <TabsTrigger value="general">General Reminders ({generalReminders.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="customer">
            <Card>
                <CardContent className="pt-6">
                {customerReminders.length > 0 ? (
                    <div className="space-y-6">
                        {customerReminders.map(reminder => {
                        const customer = customers.find(c => c.id === reminder.customerId);
                        return (
                            <div key={reminder.id} className="flex items-start gap-4">
                            <div className="bg-accent/20 text-accent-foreground rounded-full h-10 w-10 flex items-center justify-center">
                                <Bell className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold text-lg">Follow up with {customer?.contactPerson || customer?.name}</p>
                                <p className="text-md text-muted-foreground">{reminder.notes}</p>
                                <p className="text-sm text-muted-foreground pt-1">{format(new Date(reminder.date), "EEEE, MMMM do, yyyy")}</p>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => toggleReminderComplete(reminder.id)}>Mark as Complete</Button>
                            </div>
                        );
                        })}
                    </div>
                ) : <p className="text-muted-foreground text-center py-12">No upcoming customer reminders.</p>}
                </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="general">
             <Card>
                <CardContent className="pt-6">
                {generalReminders.length > 0 ? (
                    <div className="space-y-6">
                        {generalReminders.map(reminder => {
                        return (
                            <div key={reminder.id} className="flex items-start gap-4">
                            <div className="bg-accent/20 text-accent-foreground rounded-full h-10 w-10 flex items-center justify-center">
                                <Bell className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold text-lg">{reminder.notes}</p>
                                <p className="text-sm text-muted-foreground pt-1">{format(new Date(reminder.date), "EEEE, MMMM do, yyyy")}</p>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => toggleReminderComplete(reminder.id)}>Mark as Complete</Button>
                            </div>
                        );
                        })}
                    </div>
                ) : <p className="text-muted-foreground text-center py-12">No upcoming general reminders.</p>}
                </CardContent>
            </Card>
          </TabsContent>
      </Tabs>
    </div>
  );
}

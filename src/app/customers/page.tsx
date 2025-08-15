
"use client";

import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileDown, MoreHorizontal, Search, User, Mail, Phone, MapPin, Trash2 } from "lucide-react";
import { interactions, type Customer } from "@/lib/data";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { exportToExcel } from '@/lib/excel';
import { Input } from "@/components/ui/input";
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { useCustomers } from '@/context/customer-context';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';


export default function CustomersPage() {
  const { customers, updateCustomerField, updateCustomerStatus, deleteCustomer } = useCustomers();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const handleExport = () => {
    exportToExcel(customers, 'bb-sales-pro-customers.xlsx');
  };

  const getStatusVariant = (status: "Active" | "Inactive" | "Lead") => {
    switch (status) {
      case "Active":
        return "default";
      case "Inactive":
        return "secondary";
      case "Lead":
        return "outline";
    }
  }

  const getLastInteractionDate = (customerId: string) => {
    const customerInteractions = interactions
      .filter(i => i.customerId === customerId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    if (customerInteractions.length > 0) {
      return format(new Date(customerInteractions[0].date), "PPP");
    }
    return "N/A";
  }

  const handleFieldChange = (customerId: string, field: keyof Omit<Customer, 'id' | 'status'>, value: string) => {
    updateCustomerField(customerId, field, value);
    // Also update the selected customer in state so the sheet reflects the change instantly
    if (selectedCustomer && selectedCustomer.id === customerId) {
        setSelectedCustomer({...selectedCustomer, [field]: value});
    }
  };
  
  const handleStatusChange = (customerId: string, status: Customer['status']) => {
    updateCustomerStatus(customerId, status);
    if (selectedCustomer && selectedCustomer.id === customerId) {
        setSelectedCustomer({...selectedCustomer, status: status});
    }
  }

  const handleDeleteCustomer = (customerId: string) => {
    deleteCustomer(customerId);
    setSelectedCustomer(null);
    toast({
      title: "Customer Deleted",
      description: "The customer has been permanently removed.",
    });
  }

  const filteredCustomers = customers.filter(customer =>
    (customer.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (customer.town?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Customers</h2>
        <div className="flex items-center space-x-2">
          <Button onClick={handleExport}>
            <FileDown className="mr-2 h-4 w-4" />
            Export XLSX
          </Button>
        </div>
      </div>
      <div className="relative mb-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
              type="search"
              placeholder="Search customers by name or town..."
              className="w-full pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
          />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer Name</TableHead>
              <TableHead>Town</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Interaction</TableHead>
              <TableHead><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.map((customer) => (
              <TableRow key={customer.id} onClick={() => setSelectedCustomer(customer)} className="cursor-pointer">
                <TableCell className="font-medium">{customer.name}</TableCell>
                <TableCell>{customer.town}</TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                             <Button variant="ghost" className="p-0 h-auto font-normal">
                                <Badge variant={getStatusVariant(customer.status)}>{customer.status}</Badge>
                             </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                            <DropdownMenuItem onSelect={() => handleStatusChange(customer.id, 'Active')}>Active</DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => handleStatusChange(customer.id, 'Lead')}>Lead</DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => handleStatusChange(customer.id, 'Inactive')}>Inactive</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </TableCell>
                <TableCell>{getLastInteractionDate(customer.id)}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup="true" size="icon" variant="ghost" onClick={(e) => e.stopPropagation()}>
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setSelectedCustomer(customer)}>View Details</DropdownMenuItem>
                      <DropdownMenuSeparator />
                       <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem
                                onSelect={(e) => e.preventDefault()}
                                className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                            >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the customer and all associated data.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteCustomer(customer.id)}>Continue</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

       <Sheet open={!!selectedCustomer} onOpenChange={(isOpen) => !isOpen && setSelectedCustomer(null)}>
            <SheetContent className="sm:max-w-lg w-full flex flex-col">
                {selectedCustomer && (
                    <>
                        <SheetHeader className="pb-4">
                             <div className="flex items-center gap-4">
                                <Avatar className="h-16 w-16">
                                    <AvatarImage src={`https://placehold.co/64x64.png?text=${selectedCustomer.name.charAt(0)}`} />
                                    <AvatarFallback>{selectedCustomer.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <SheetTitle className="text-2xl">{selectedCustomer.name}</SheetTitle>
                                    <SheetDescription>
                                        <Badge variant={getStatusVariant(selectedCustomer.status)}>{selectedCustomer.status}</Badge>
                                    </SheetDescription>
                                </div>
                            </div>
                        </SheetHeader>
                        <div className="space-y-4 flex-1 overflow-y-auto pr-4">
                            <div className="space-y-2">
                                <Label htmlFor="name"><User className="inline-block mr-2 h-4 w-4" />Customer Name</Label>
                                <Input id="name" defaultValue={selectedCustomer.name} onBlur={(e) => handleFieldChange(selectedCustomer.id, 'name', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="contactPerson"><User className="inline-block mr-2 h-4 w-4" />Contact Person</Label>
                                <Input id="contactPerson" defaultValue={selectedCustomer.contactPerson} onBlur={(e) => handleFieldChange(selectedCustomer.id, 'contactPerson', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="town"><MapPin className="inline-block mr-2 h-4 w-4" />Town</Label>
                                <Input id="town" defaultValue={selectedCustomer.town} onBlur={(e) => handleFieldChange(selectedCustomer.id, 'town', e.target.value)} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="address"><MapPin className="inline-block mr-2 h-4 w-4" />Address</Label>
                                <Input id="address" defaultValue={selectedCustomer.address} onBlur={(e) => handleFieldChange(selectedCustomer.id, 'address', e.target.value)} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="phone"><Phone className="inline-block mr-2 h-4 w-4" />Phone</Label>
                                <Input id="phone" defaultValue={selectedCustomer.phone} onBlur={(e) => handleFieldChange(selectedCustomer.id, 'phone', e.target.value)} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="email"><Mail className="inline-block mr-2 h-4 w-4" />Email</Label>
                                <Input id="email" defaultValue={selectedCustomer.email} onBlur={(e) => handleFieldChange(selectedCustomer.id, 'email', e.target.value)} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="status"><Badge className="mr-2" />Status</Label>
                                <Select
                                    defaultValue={selectedCustomer.status}
                                    onValueChange={(value: Customer['status']) => handleStatusChange(selectedCustomer.id, value)}
                                >
                                    <SelectTrigger id="status" className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                    <SelectItem value="Active">Active</SelectItem>
                                    <SelectItem value="Inactive">Inactive</SelectItem>
                                    <SelectItem value="Lead">Lead</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <SheetFooter className="pt-4">
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" className="w-full">
                                        <Trash2 className="mr-2 h-4 w-4" /> Delete Customer
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete the customer and all their associated data from the app.
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        className="bg-destructive hover:bg-destructive/90"
                                        onClick={() => handleDeleteCustomer(selectedCustomer.id)}
                                    >
                                        Yes, delete customer
                                    </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </SheetFooter>
                    </>
                )}
            </SheetContent>
        </Sheet>
    </div>
  );
}

    

"use client";

import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileDown, MoreHorizontal, Search, User, Mail, Phone, MapPin, Trash2, ChevronRight, Zap } from "lucide-react";
import { type Customer } from "@/lib/data";
import { type Interaction } from "@/lib/data";
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
import { Card, CardContent } from '@/components/ui/card';
import { useInteractions } from '@/context/interaction-context';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';


export default function CustomersPage() {
  const { customers, updateCustomerField, updateCustomerStatus, deleteCustomer } = useCustomers();
  const { interactions } = useInteractions();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

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

  const getInteractionBadgeVariant = (type: Interaction['type']): "secondary" | "outline" | "destructive" => {
    switch (type) {
        case 'Competitor Activity':
            return 'destructive';
        case 'Email':
            return 'secondary';
        default:
            return 'outline';
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

  const customerInteractions = selectedCustomer ? interactions
    .filter(i => i.customerId === selectedCustomer.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) : [];

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Customers</h2>
        <div className="flex items-center space-x-2">
          <Button onClick={handleExport}>
            <FileDown className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Export XLSX</span>
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
      
      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {isClient && filteredCustomers.map(customer => (
           <Card key={customer.id} onClick={() => setSelectedCustomer(customer)} className="cursor-pointer">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <Avatar className="h-10 w-10">
                      <AvatarImage src={`https://placehold.co/40x40.png?text=${customer.name.charAt(0)}`} />
                      <AvatarFallback>{customer.name.charAt(0)}</AvatarFallback>
                   </Avatar>
                   <div>
                    <p className="font-semibold">{customer.name}</p>
                    <p className="text-sm text-muted-foreground">{customer.town}</p>
                   </div>
                </div>
                 <div className='flex items-center gap-2'>
                  <Badge variant={getStatusVariant(customer.status)}>{customer.status}</Badge>
                  <ChevronRight className="h-5 w-5 text-muted-foreground"/>
                 </div>
              </CardContent>
           </Card>
        ))}
        {!isClient && <p>Loading customers...</p>}
      </div>


      {/* Desktop Table View */}
      <div className="rounded-md border hidden md:block">
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
            {isClient && filteredCustomers.map((customer) => (
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
            {!isClient && (
                <TableRow>
                    <TableCell colSpan={5} className="text-center">Loading customers...</TableCell>
                </TableRow>
            )}
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
                                    <SheetDescription asChild>
                                        <Badge variant={getStatusVariant(selectedCustomer.status)}>{selectedCustomer.status}</Badge>
                                    </SheetDescription>
                                </div>
                            </div>
                        </SheetHeader>
                        <ScrollArea className="flex-1 -mr-6">
                        <div className="space-y-4 pr-6">
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
                            <Separator />
                             <div>
                                <h4 className="font-semibold mb-4">Interaction History</h4>
                                <div className="space-y-4">
                                    {customerInteractions.length > 0 ? customerInteractions.map(interaction => (
                                        <div key={interaction.id} className="text-sm">
                                            <div className="flex justify-between items-center">
                                                <p className="font-medium">{format(new Date(interaction.date), "PPP p")}</p>
                                                <Badge variant={getInteractionBadgeVariant(interaction.type)}>
                                                    {interaction.type === 'Competitor Activity' && <Zap className="mr-1 h-3 w-3" />}
                                                    {interaction.type}
                                                </Badge>
                                            </div>
                                            <p className="text-muted-foreground whitespace-pre-wrap pl-2 border-l-2 ml-2 mt-1">{interaction.notes}</p>
                                        </div>
                                    )) : <p className="text-muted-foreground text-sm text-center">No interactions logged yet.</p>}
                                </div>
                            </div>
                        </div>
                        </ScrollArea>
                        <SheetFooter className="pt-4 mt-auto">
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

    
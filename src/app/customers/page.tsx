
"use client";

import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileDown, MoreHorizontal, Search } from "lucide-react";
import { interactions, type Customer } from "@/lib/data";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { exportToExcel } from '@/lib/excel';
import { Input } from "@/components/ui/input";
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { useCustomers } from '@/context/customer-context';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function CustomersPage() {
  const { customers, updateCustomerField, updateCustomerStatus } = useCustomers();
  const [searchTerm, setSearchTerm] = useState("");

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
  };

  const filteredCustomers = customers.filter(customer =>
    (customer.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (customer.town?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (customer.contactPerson?.toLowerCase() || '').includes(searchTerm.toLowerCase())
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
              placeholder="Search customers by name, town, or contact..."
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
              <TableHead>Address</TableHead>
              <TableHead>Contact Person</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Interaction</TableHead>
              <TableHead><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell className="font-medium">
                  <Input
                    defaultValue={customer.name}
                    onBlur={(e) => handleFieldChange(customer.id, 'name', e.target.value)}
                    className="border-none bg-transparent"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    defaultValue={customer.town}
                    onBlur={(e) => handleFieldChange(customer.id, 'town', e.target.value)}
                    className="border-none bg-transparent"
                  />
                </TableCell>
                <TableCell>
                   <Input
                    defaultValue={customer.address}
                    onBlur={(e) => handleFieldChange(customer.id, 'address', e.target.value)}
                    className="border-none bg-transparent"
                  />
                </TableCell>
                <TableCell>
                   <Input
                    defaultValue={customer.contactPerson}
                    onBlur={(e) => handleFieldChange(customer.id, 'contactPerson', e.target.value)}
                    className="border-none bg-transparent"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    defaultValue={customer.phone}
                    onBlur={(e) => handleFieldChange(customer.id, 'phone', e.target.value)}
                    className="border-none bg-transparent"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    defaultValue={customer.email}
                    onBlur={(e) => handleFieldChange(customer.id, 'email', e.target.value)}
                    className="border-none bg-transparent"
                  />
                </TableCell>
                <TableCell>
                   <Select
                    defaultValue={customer.status}
                    onValueChange={(value: Customer['status']) => updateCustomerStatus(customer.id, value)}
                  >
                    <SelectTrigger className="w-[100px] border-none bg-transparent">
                      <SelectValue asChild>
                         <Badge variant={getStatusVariant(customer.status)}>{customer.status}</Badge>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                      <SelectItem value="Lead">Lead</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>{getLastInteractionDate(customer.id)}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Log Interaction</DropdownMenuItem>
                      <DropdownMenuItem>Set Reminder</DropdownMenuItem>
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

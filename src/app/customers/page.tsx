"use client";

import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileDown, MoreHorizontal, Upload, FilePlus } from "lucide-react";
import { customers, interactions } from "@/lib/data";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { exportToCsv } from '@/lib/csv';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';


export default function CustomersPage() {
  const handleExport = () => {
    exportToCsv(customers, 'deli-sales-pro-customers.csv');
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

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Customers</h2>
        <div className="flex items-center space-x-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <FilePlus className="mr-2 h-4 w-4" />
                Import
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Upload Customer List</DialogTitle>
                <DialogDescription>
                  Import your customer data by uploading a CSV file. Make sure the file has columns for name, town, address, contact person, phone, email, and status.
                </DialogDescription>
              </DialogHeader>
              <div className="grid w-full items-center gap-1.5 py-4">
                  <Label htmlFor="customer-file">CSV File</Label>
                  <Input id="customer-file" type="file" accept=".csv" />
              </div>
              <Button className="w-full mt-2">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload and Import
              </Button>
            </DialogContent>
          </Dialog>
          <Button onClick={handleExport}>
            <FileDown className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
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
            {customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell className="font-medium">{customer.name}</TableCell>
                <TableCell>{customer.town}</TableCell>
                <TableCell>{customer.address}</TableCell>
                <TableCell>{customer.contactPerson}</TableCell>
                <TableCell>{customer.phone}</TableCell>
                <TableCell>{customer.email}</TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(customer.status)}>{customer.status}</Badge>
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

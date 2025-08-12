"use client";

import React from 'react';
import * as XLSX from 'xlsx';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useCustomers } from '@/context/customer-context';
import type { Customer } from '@/lib/data';
import { FilePlus } from 'lucide-react';


export default function SettingsPage() {
    const { setCustomers } = useCustomers();
    const { toast } = useToast();

    const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            try {
              const data = new Uint8Array(e.target?.result as ArrayBuffer);
              const workbook = XLSX.read(data, { type: 'array' });
              const sheetName = workbook.SheetNames[0];
              const worksheet = workbook.Sheets[sheetName];
              const json = XLSX.utils.sheet_to_json<any>(worksheet);
    
              const newCustomers: Customer[] = json.map((row, index) => ({
                id: `imported-${Date.now()}-${index}`,
                name: row['Customer Name'] || row['name'] || '',
                town: row['Town'] || row['town'] || '',
                address: row['Address'] || row['address'] || '',
                contactPerson: row['Contact Person'] || row['contactPerson'] || '',
                phone: row['Phone'] || row['phone'] || '',
                email: row['Email'] || row['email'] || '',
                status: row['Status'] || row['status'] || 'Lead',
              }));
    
              setCustomers(prev => [...prev, ...newCustomers]);
              toast({
                title: "Success",
                description: `${newCustomers.length} customers imported successfully.`,
              });
            } catch (error) {
              console.error("Error parsing Excel file:", error);
              toast({
                title: "Import Failed",
                description: "Could not parse the Excel file. Please check the format.",
                variant: "destructive",
              });
            }
          };
          reader.readAsArrayBuffer(file);
        }
    };

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        </div>
        <Card>
            <CardHeader>
            <CardTitle>Data Management</CardTitle>
            <CardDescription>Manage your application data here.</CardDescription>
            </CardHeader>
            <CardContent>
                <Dialog>
                    <DialogTrigger asChild>
                    <Button variant="outline">
                        <FilePlus className="mr-2 h-4 w-4" />
                        Import Customers
                    </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Upload Customer List</DialogTitle>
                        <DialogDescription>
                        Import your customer data by uploading an Excel file. Make sure the file has columns for Customer Name, Town, Address, Contact Person, Phone, Email, and Status.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid w-full items-center gap-1.5 py-4">
                        <Label htmlFor="customer-file">Excel File</Label>
                        <Input id="customer-file" type="file" accept=".xlsx, .xls" onChange={handleFileImport} />
                    </div>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
        </div>
    );
}

"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";

export default function ImportPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Import Customers</h2>
      </div>
      <Card className="max-w-xl mx-auto">
        <CardHeader>
          <CardTitle>Upload Customer List</CardTitle>
          <CardDescription>
            Import your customer data by uploading a CSV file. Make sure the file has columns for name, company, and email.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="customer-file">CSV File</Label>
                <Input id="customer-file" type="file" accept=".csv" />
            </div>
            <Button className="w-full mt-6">
                <Upload className="mr-2 h-4 w-4" />
                Upload and Import
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}

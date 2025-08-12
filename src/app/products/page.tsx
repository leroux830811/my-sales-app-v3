"use client";

import React from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDown, ShoppingCart } from "lucide-react";
import { products, type Product } from "@/lib/data";
import { Badge } from '@/components/ui/badge';
import { exportToCsv } from '@/lib/csv';

export default function ProductsPage() {

    const handleExport = () => {
        exportToCsv(products.map(p => ({...p, image: ''})), 'deli-sales-pro-products.csv');
    };

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Product Catalog</h2>
                <Button onClick={handleExport}>
                    <FileDown className="mr-2 h-4 w-4" />
                    Export CSV
                </Button>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {products.map((product) => (
                    <Card key={product.id}>
                        <CardHeader>
                            <div className="relative h-48 w-full mb-4">
                                <Image 
                                    src="https://placehold.co/600x400.png"
                                    alt={product.name} 
                                    fill
                                    className="rounded-md object-cover"
                                    data-ai-hint={product.image.split('"')[1].split('="')[1]}
                                />
                            </div>
                            <CardTitle>{product.name}</CardTitle>
                            <CardDescription>{product.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-between items-center">
                                <p className="text-2xl font-semibold">${product.price.toFixed(2)}</p>
                                <Badge variant={product.stock > 100 ? "default" : "secondary"}>
                                    {product.stock} in stock
                                </Badge>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full">
                                <ShoppingCart className="mr-2 h-4 w-4" /> Add to Order
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}

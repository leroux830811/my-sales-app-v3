"use client";

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDown, ShoppingCart, Weight, Search } from "lucide-react";
import type { Product } from "@/lib/data";
import { Badge } from '@/components/ui/badge';
import { exportToCsv } from '@/lib/csv';
import { useProducts } from '@/context/product-context';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

export default function ProductsPage() {
    const { products, setProducts } = useProducts();
    const { toast } = useToast();
    const [productSearch, setProductSearch] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

    const handleExport = () => {
        exportToCsv(products.map(p => ({...p, image: ''})), 'bb-sales-pro-products.csv');
    };

    const handleImageClick = (productId: string) => {
        setSelectedProductId(productId);
        fileInputRef.current?.click();
    }

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && selectedProductId) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const newProducts = products.map(p => {
                    if (p.id === selectedProductId) {
                        return { ...p, image: reader.result as string };
                    }
                    return p;
                });
                setProducts(newProducts);
                toast({
                    title: "Image updated",
                    description: `The image for the product has been changed.`
                });
            }
            reader.readAsDataURL(file);
        }
        // Reset selected product ID and file input
        setSelectedProductId(null);
        if(fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }

    const filteredProducts = products.filter(product => 
        product.name.toLowerCase().includes(productSearch.toLowerCase())
    );

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
             <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
            />
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Product Catalog</h2>
                <div className="flex items-center space-x-2">
                    <Button onClick={handleExport}>
                        <FileDown className="mr-2 h-4 w-4" />
                        Export CSV
                    </Button>
                </div>
            </div>
            <div className="relative mb-4">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search products..."
                    className="w-full pl-8"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                />
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredProducts.map((product) => (
                    <Card key={product.id}>
                        <CardHeader>
                            <div className="relative h-48 w-full mb-4 cursor-pointer" onClick={() => handleImageClick(product.id)}>
                                <Image 
                                    src={product.image.startsWith('data:') ? product.image : "https://placehold.co/600x400.png"}
                                    alt={product.name} 
                                    fill
                                    className="rounded-md object-cover"
                                    data-ai-hint={product.image.split('"')[1]?.split('="')[1] || "deli meat"}
                                />
                            </div>
                            <CardTitle>{product.name}</CardTitle>
                            <CardDescription>{product.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <div className="flex justify-between items-center mb-2">
                                <p className="text-sm text-muted-foreground flex items-center gap-1"><Weight className="h-4 w-4"/> {product.size}</p>
                            </div>
                            <div className="flex justify-between items-center">
                                <p className="text-2xl font-semibold">R{product.price.toFixed(2)}</p>
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

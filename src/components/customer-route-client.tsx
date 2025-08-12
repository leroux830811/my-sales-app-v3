"use client";

import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { MapPin, StickyNote, Package, PlusCircle, Check, ChevronsUpDown, ShoppingCart, MinusCircle, Search } from "lucide-react";
import type { Customer, Product } from "@/lib/data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Separator } from "./ui/separator";
import { useCustomers } from "@/context/customer-context";
import { useInteractions } from "@/context/interaction-context";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useProducts } from "@/context/product-context";
import { Input } from "./ui/input";


export default function CustomerRouteClient() {
  const { customers } = useCustomers();
  const { products } = useProducts();
  const { interactions, addInteraction } = useInteractions();
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [noteText, setNoteText] = useState("");
  const { toast } = useToast();
  const [order, setOrder] = useState<Map<string, number>>(new Map());
  const [productSearch, setProductSearch] = useState("");

  const selectedCustomer = customers && customers.find((c) => c.id === selectedCustomerId);
  const customerInteractions = interactions
    .filter(i => i.customerId === selectedCustomerId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  const handleCustomerChange = (customerId: string) => {
    setSelectedCustomerId(customerId);
    setOrder(new Map()); // Reset order when customer changes
    setOpen(false);
  };

  const handleSaveNote = () => {
    if (!selectedCustomerId || !noteText.trim()) {
        toast({
            title: "Note is empty",
            description: "Please write a note before saving.",
            variant: "destructive"
        })
        return;
    };
    addInteraction({
      customerId: selectedCustomerId,
      notes: noteText,
      type: "Meeting", // Defaulting to meeting, can be changed later
    });
    setNoteText("");
    toast({
        title: "Note Saved",
        description: "Your interaction has been logged."
    })
  };

  const handleAddToOrder = (productId: string) => {
    const newOrder = new Map(order);
    const currentQuantity = newOrder.get(productId) || 0;
    newOrder.set(productId, currentQuantity + 1);
    setOrder(newOrder);
  }

  const handleRemoveFromOrder = (productId: string) => {
    const newOrder = new Map(order);
    const currentQuantity = newOrder.get(productId);
    if (currentQuantity && currentQuantity > 1) {
        newOrder.set(productId, currentQuantity - 1);
    } else if (currentQuantity === 1) {
        newOrder.delete(productId);
    }
    setOrder(newOrder);
  }

  const handleSendToWhatsApp = () => {
    if (!selectedCustomer) {
        toast({ title: "No customer selected", variant: "destructive" });
        return;
    }
    if (order.size === 0) {
        toast({ title: "Order is empty", description: "Please add products to the order first.", variant: "destructive" });
        return;
    }

    const phoneNumber = "1234567890"; // IMPORTANT: Replace with the target WhatsApp number
    let message = `*New Order for ${selectedCustomer.name}*\n\n`;
    order.forEach((quantity, productId) => {
        const product = products.find(p => p.id === productId);
        if(product) {
            message += `- ${product.name} (${product.size}) x${quantity}\n`;
        }
    });
    
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    toast({ title: "Order Sent", description: "The order has been formatted for WhatsApp." });
  };
  
  if (!customers || !products) {
    return (
        <Card className="flex items-center justify-center h-96">
            <div className="text-center text-muted-foreground">
                <p>Loading data...</p>
            </div>
        </Card>
    )
  }

  return (
    <div>
      <Card className="mb-6">
        <CardHeader>
            <CardTitle>Select a Customer</CardTitle>
            <CardDescription>Choose a customer from the list to view their details and plan your route.</CardDescription>
        </CardHeader>
        <CardContent>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between md:w-1/2"
              >
                {selectedCustomerId
                  ? customers.find((customer) => customer.id === selectedCustomerId)?.name
                  : "Select a customer..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0 md:w-[--radix-popover-trigger-width]">
              <Command>
                <CommandInput placeholder="Search customer..." />
                <CommandList>
                  <CommandEmpty>No customer found.</CommandEmpty>
                  <CommandGroup>
                    {customers.map((customer) => (
                      <CommandItem
                        key={customer.id}
                        value={customer.name}
                        onSelect={() => handleCustomerChange(customer.id)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedCustomerId === customer.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {customer.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </CardContent>
      </Card>
      
      {selectedCustomer && (
        <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
                <Card>
                    <CardHeader className="flex flex-row items-center gap-4">
                        <Avatar className="h-16 w-16">
                            <AvatarImage src={`https://placehold.co/64x64.png?text=${selectedCustomer.name.charAt(0)}`} />
                            <AvatarFallback>{selectedCustomer.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle className="text-xl">{selectedCustomer.name}</CardTitle>
                            <CardDescription>{selectedCustomer.contactPerson}</CardDescription>
                            <p className="text-sm text-muted-foreground pt-1">{selectedCustomer.email}</p>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64 bg-muted rounded-md flex items-center justify-center">
                            <p className="text-muted-foreground flex items-center gap-2"><MapPin className="h-4 w-4"/> Map Placeholder</p>
                        </div>
                         <Button className="w-full mt-4">Get Directions</Button>
                    </CardContent>
                </Card>
            </div>
            <div className="md:col-span-2">
                 <Card>
                    <CardContent className="p-6">
                        <Tabs defaultValue="notes">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="notes"><StickyNote className="mr-2"/> Notes & Interactions</TabsTrigger>
                                <TabsTrigger value="order"><Package className="mr-2"/> Place Order</TabsTrigger>
                            </TabsList>
                            <TabsContent value="notes">
                                <div className="mt-4">
                                    <h3 className="font-semibold mb-2">Log New Interaction</h3>
                                    <Textarea 
                                      placeholder={`Add a note about ${selectedCustomer.name}...`} 
                                      className="mb-2"
                                      value={noteText}
                                      onChange={(e) => setNoteText(e.target.value)}
                                    />
                                    <Button size="sm" onClick={handleSaveNote}>Save Note</Button>
                                </div>
                                <Separator className="my-6"/>
                                <div>
                                    <h3 className="font-semibold mb-4">Past Interactions</h3>
                                    <div className="space-y-4">
                                        {customerInteractions.map(interaction => (
                                            <div key={interaction.id} className="text-sm">
                                                <p className="font-medium">{format(new Date(interaction.date), "PPP")} - {interaction.type}</p>
                                                <p className="text-muted-foreground pl-2 border-l-2 ml-2 mt-1">{interaction.notes}</p>
                                            </div>
                                        ))}
                                         {customerInteractions.length === 0 && <p className="text-muted-foreground text-sm">No past interactions logged.</p>}
                                    </div>
                                </div>
                            </TabsContent>
                            <TabsContent value="order">
                                <div className="mt-4">
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
                                     <h3 className="font-semibold mb-4">Product List</h3>
                                     <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                                        {filteredProducts.map(product => {
                                            const quantity = order.get(product.id) || 0;
                                            return (
                                                <div key={product.id} className="flex justify-between items-center">
                                                    <div>
                                                        <p className="font-medium">{product.name}</p>
                                                        <p className="text-sm text-muted-foreground">R{product.price.toFixed(2)} / {product.size}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {quantity > 0 && (
                                                            <>
                                                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleRemoveFromOrder(product.id)}><MinusCircle /></Button>
                                                                <span className="font-bold w-4 text-center">{quantity}</span>
                                                            </>
                                                        )}
                                                        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => handleAddToOrder(product.id)}><PlusCircle /></Button>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                         {filteredProducts.length === 0 && <p className="text-muted-foreground text-sm text-center py-4">No products found.</p>}
                                     </div>
                                     <Separator className="my-6"/>
                                     <Button className="w-full" onClick={handleSendToWhatsApp} disabled={order.size === 0}>
                                        <ShoppingCart className="mr-2 h-4 w-4" /> Send to WhatsApp
                                     </Button>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                 </Card>
            </div>
        </div>
      )}
       {!selectedCustomer && (
            <Card className="flex items-center justify-center h-96">
                <div className="text-center text-muted-foreground">
                    <p>Select a customer to view their details.</p>
                </div>
            </Card>
        )}
    </div>
  );
}

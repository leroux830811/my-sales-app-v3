
"use client";

import { useState, useEffect, useMemo } from "react";
import Image from 'next/image';
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
import { MapPin, StickyNote, Package, PlusCircle, Check, ChevronsUpDown, ShoppingCart, MinusCircle, Search, Camera, Navigation, UserPlus, X, Zap, Undo2 } from "lucide-react";
import type { Customer, Interaction, Product } from "@/lib/data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Separator } from "./ui/separator";
import { useCustomers } from "@/context/customer-context";
import { useInteractions } from "@/context/interaction-context";
import { cn } from "@/lib/utils";
import { format, isToday } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useProducts } from "@/context/product-context";
import { Input } from "./ui/input";
import { useOrders } from "@/context/order-context";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { CameraCapture } from "./camera-capture";
import { usePhotos } from "@/context/photo-context";
import { useReminders } from "@/context/reminder-context";
import { useRoute } from "@/context/route-context";
import { ScrollArea } from "./ui/scroll-area";
import { useStockReturns } from "@/context/stock-return-context";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"


interface CustomerRouteClientProps {
    mode: 'route' | 'all';
}

export default function CustomerRouteClient({ mode: initialMode }: CustomerRouteClientProps) {
  const { customers, updateCustomerImage, updateCustomerAddress } = useCustomers();
  const { products } = useProducts();
  const { interactions, addInteraction } = useInteractions();
  const { addOrder } = useOrders();
  const { addPhoto } = usePhotos();
  const { reminders } = useReminders();
  const { getTodaysRoute, markCustomerAsCompleted } = useRoute();
  const { addStockReturn } = useStockReturns();

  const [mode, setMode] = useState(initialMode);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [competitorNoteText, setCompetitorNoteText] = useState("");
  const { toast } = useToast();
  const [order, setOrder] = useState<Map<string, number>>(new Map());
  const [stockReturnItems, setStockReturnItems] = useState<Map<string, number>>(new Map());
  const [stockReturnReason, setStockReturnReason] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [checklistProductSearch, setChecklistProductSearch] = useState("");
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraPurpose, setCameraPurpose] = useState<'storefront' | 'interaction' | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [productChecklist, setProductChecklist] = useState<Map<string, boolean>>(new Map());

  useEffect(() => {
    setIsClient(true);
  }, []);

  const selectedCustomer = customers && customers.find((c) => c.id === selectedCustomerId);
  
  const todaysRoute = useMemo(() => getTodaysRoute(), [getTodaysRoute]);
  
  const uncompletedRouteCustomers = useMemo(() => {
    // Show only customers that have not been completed yet in the dropdown
    const uncompletedCustomerIds = todaysRoute.filter(rc => !rc.completed).map(rc => rc.id);
    return customers.filter(c => uncompletedCustomerIds.includes(c.id));
  }, [customers, todaysRoute]);

  const customerInteractions = interactions
    .filter(i => i.customerId === selectedCustomerId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filteredProducts = products.filter(product =>
    (product.name || "").toLowerCase().includes(productSearch.toLowerCase())
  );
  
  const filteredChecklistProducts = products.filter(product =>
    (product.name || "").toLowerCase().includes(checklistProductSearch.toLowerCase())
  );

  const customerList = mode === 'route' ? uncompletedRouteCustomers : customers;

  useEffect(() => {
    // Reset selected customer when mode changes
    setSelectedCustomerId(null);
  }, [mode]);

  useEffect(() => {
    if (selectedCustomer) {
      const customerReminders = reminders.filter(r => r.customerId === selectedCustomer.id && !r.isComplete && isToday(new Date(r.date)));
      if(customerReminders.length > 0) {
        toast({
            title: `Reminder for ${selectedCustomer.name}`,
            description: customerReminders.map(r => r.notes).join(', '),
        })
      }
    }
  }, [selectedCustomer, reminders, toast]);

  const handleCustomerChange = (customerId: string) => {
    setSelectedCustomerId(customerId);
    setOrder(new Map()); // Reset order when customer changes
    setStockReturnItems(new Map()); // Reset returns
    setStockReturnReason("");
    setProductChecklist(new Map());
    setOpen(false);
  };

  const handleInteractionCompletion = () => {
    if (selectedCustomerId && mode === 'route') {
      markCustomerAsCompleted(selectedCustomerId);
       // After completing, if the current customer was the last one, clear the selection
      if (uncompletedRouteCustomers.length === 1 && uncompletedRouteCustomers[0].id === selectedCustomerId) {
        setSelectedCustomerId(null);
      }
    }
  }

  const handleSaveNote = (type: Interaction['type'], text: string, setText: (value: string) => void) => {
    if (!selectedCustomerId) {
        toast({
            title: "No customer selected",
            variant: "destructive"
        })
        return;
    };
    
    let noteToSave = text;
    const checkedProducts = Array.from(productChecklist.entries()).filter(([, isChecked]) => isChecked);

    if (checkedProducts.length > 0) {
        let checklistText = "\n\n---\n*Product Stock Check:*\n";
        products.forEach(product => {
            const isChecked = productChecklist.get(product.id);
            if (isChecked) {
                 checklistText += `- ${product.name}: In Stock\n`;
            }
        });
        noteToSave += checklistText;
    }
    
    if (!noteToSave.trim()) {
        toast({
            title: "Note is empty",
            description: "Please write a note or check a product before saving.",
            variant: "destructive"
        })
        return;
    }

    addInteraction({
      customerId: selectedCustomerId,
      notes: noteToSave,
      type: type,
    });
    setText("");
    setProductChecklist(new Map());
    toast({
        title: "Note Saved",
        description: `Your ${type === 'Meeting' ? 'interaction' : 'competitor note'} has been logged.`
    });
    handleInteractionCompletion();
  };
  
  const handleProductChecklistChange = (productId: string, isChecked: boolean) => {
    const newChecklist = new Map(productChecklist);
    newChecklist.set(productId, isChecked);
    setProductChecklist(newChecklist);
  }

  const handleUpdateItemQuantity = (
    productId: string, 
    map: Map<string, number>, 
    setMap: React.Dispatch<React.SetStateAction<Map<string, number>>>,
    change: 'add' | 'remove'
    ) => {
    const newMap = new Map(map);
    const currentQuantity = newMap.get(productId) || 0;
    
    if (change === 'add') {
        newMap.set(productId, currentQuantity + 1);
    } else {
        if (currentQuantity > 1) {
            newMap.set(productId, currentQuantity - 1);
        } else if (currentQuantity === 1) {
            newMap.delete(productId);
        }
    }
    setMap(newMap);
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

    addOrder({
        customerId: selectedCustomer.id,
        items: order,
    });

    const phoneNumber = "27826064648"; // IMPORTANT: Replace with the target WhatsApp number
    let message = `*New Order for ${selectedCustomer.name}*\n\n`;
    order.forEach((quantity, productId) => {
        const product = products.find(p => p.id === productId);
        if(product) {
            message += `- ${product.name} (${product.size}) x${quantity}\n`;
        }
    });
    
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    toast({ title: "Order Sent & Saved", description: "The order has been saved and formatted for WhatsApp." });
    setOrder(new Map());
    handleInteractionCompletion();
  };
  
  const handleProcessReturn = () => {
     if (!selectedCustomer) {
        toast({ title: "No customer selected", variant: "destructive" });
        return;
    }
    if (stockReturnItems.size === 0) {
        toast({ title: "No items selected", description: "Please add products to the return.", variant: "destructive" });
        return;
    }
    if (!stockReturnReason.trim()) {
        toast({ title: "Reason is missing", description: "Please provide a reason for the return.", variant: "destructive" });
        return;
    }

    addStockReturn({
        customerId: selectedCustomer.id,
        items: stockReturnItems,
        reason: stockReturnReason,
    });

    const phoneNumber = "27826064648"; // IMPORTANT: Replace with the target WhatsApp number
    let message = `*Stock Return for ${selectedCustomer.name}*\n\nReason: ${stockReturnReason}\n\n`;
    stockReturnItems.forEach((quantity, productId) => {
        const product = products.find(p => p.id === productId);
        if(product) {
            message += `- ${product.name} (${product.size}) x${quantity}\n`;
        }
    });
    
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    toast({ title: "Return Processed & Saved", description: "The stock return has been saved and formatted for WhatsApp." });
    setStockReturnItems(new Map());
    setStockReturnReason("");
    handleInteractionCompletion();
  }


  const handleSavePhoto = (imageDataUri: string) => {
    if (selectedCustomerId && selectedCustomer) {
        if (cameraPurpose === 'storefront') {
            updateCustomerImage(selectedCustomerId, imageDataUri);
            toast({
                title: "Storefront Photo Saved",
                description: "The photo has been saved for this customer."
            })
        } else if (cameraPurpose === 'interaction') {
            addPhoto(imageDataUri, `Interaction photo for ${selectedCustomer.name}`);
             toast({
                title: "Interaction Photo Saved",
                description: "The photo has been saved to the general photo gallery."
            })
        }
    }
    setIsCameraOpen(false);
    setCameraPurpose(null);
  }
  
  const handlePinLocation = () => {
    if (!selectedCustomerId) {
      toast({ title: "No customer selected", variant: "destructive" });
      return;
    }
    if (!navigator.geolocation) {
      toast({ title: "Geolocation not supported", description: "Your browser does not support geolocation.", variant: "destructive" });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newAddress = `Pinned Location: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
        updateCustomerAddress(selectedCustomerId, newAddress);
        toast({ title: "Location Pinned!", description: `Address updated to: ${newAddress}` });
      },
      (error) => {
        console.error("Geolocation error:", error);
        toast({ title: "Could not get location", description: "Please ensure location services are enabled.", variant: "destructive" });
      }
    );
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

  const renderProductList = (
    map: Map<string, number>,
    setMap: React.Dispatch<React.SetStateAction<Map<string, number>>>
  ) => {
    return (
      <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
        {filteredProducts.map(product => {
            const quantity = map.get(product.id) || 0;
            return (
                <div key={product.id} className="flex justify-between items-center">
                    <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">R{product.price.toFixed(2)} / {product.size}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {quantity > 0 && (
                            <>
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleUpdateItemQuantity(product.id, map, setMap, 'remove')}><MinusCircle /></Button>
                                <span className="font-bold w-4 text-center">{quantity}</span>
                            </>
                        )}
                        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => handleUpdateItemQuantity(product.id, map, setMap, 'add')}><PlusCircle /></Button>
                    </div>
                </div>
            )
        })}
         {filteredProducts.length === 0 && <p className="text-muted-foreground text-sm text-center py-4">No products found.</p>}
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between space-y-2 mb-4">
        <div className="flex items-center gap-4">
            <h2 className="text-3xl font-bold tracking-tight">Start Call</h2>
            {isClient && todaysRoute.length > 0 && (
                 <TooltipProvider>
                    <div className="flex items-center -space-x-2">
                        {todaysRoute.map(routeCustomer => {
                             const customer = customers.find(c => c.id === routeCustomer.id);
                             if (!customer) return null;
                             return (
                             <Tooltip key={customer.id}>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className={cn("p-0 h-10 w-10 rounded-full focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", selectedCustomerId === customer.id && 'ring-2 ring-primary ring-offset-2')}
                                        onClick={() => handleCustomerChange(customer.id)}
                                        disabled={routeCustomer.completed}
                                    >
                                     <Avatar className={cn("border-2 border-background", routeCustomer.completed && "ring-2 ring-green-500")}>
                                        <AvatarImage src={`https://placehold.co/40x40.png?text=${customer.name.charAt(0)}`} />
                                        <AvatarFallback>{customer.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{customer.name}</p>
                                </TooltipContent>
                             </Tooltip>
                            )
                        })}
                    </div>
                </TooltipProvider>
            )}
        </div>
      </div>
       <Card className="mb-6">
        <CardHeader>
           {mode === 'route' ? (
                <>
                <CardTitle>Today's Route ({isClient ? uncompletedRouteCustomers.length : '...'})</CardTitle>
                <CardDescription>This list is pre-populated from your monthly plan. Select a customer to begin.</CardDescription>
                </>
           ) : (
                <>
                <CardTitle>Log Ad-Hoc Call</CardTitle>
                <CardDescription>Select any customer from your full list to log a call or place an order.</CardDescription>
                </>
           )}
        </CardHeader>
        <CardContent>
            <div className="flex gap-2 items-center">
                 <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between md:w-1/2"
                        disabled={mode === 'route' && uncompletedRouteCustomers.length === 0 && isClient}
                    >
                        {selectedCustomerId
                        ? customers.find((customer) => customer.id === selectedCustomerId)?.name
                        : mode === 'route' ? (isClient && uncompletedRouteCustomers.length > 0 ? "Select from today's route..." : "All customers for today completed!") : "Select a customer..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0 md:w-[--radix-popover-trigger-width]">
                    <Command>
                        <CommandInput placeholder="Search customer..." />
                        <CommandList>
                        <CommandEmpty>No customer found.</CommandEmpty>
                        <CommandGroup>
                            {customerList.map((customer) => (
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
                 {mode === 'route' && (
                    <Button variant="secondary" onClick={() => setMode('all')}>Log Ad-hoc Call</Button>
                 )}
                 {mode === 'all' && (
                     <Button variant="secondary" onClick={() => setMode('route')}>Back to Route</Button>
                 )}
            </div>
        </CardContent>
      </Card>
      
      {selectedCustomer && (
        <Dialog open={isCameraOpen} onOpenChange={setIsCameraOpen}>
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
                            <div className="h-64 bg-muted rounded-md flex items-center justify-center relative mb-4">
                                {selectedCustomer.storefrontImage ? (
                                    <Image src={selectedCustomer.storefrontImage} alt="Store front" layout="fill" objectFit="cover" className="rounded-md"/>
                                ) : (
                                    <p className="text-muted-foreground flex items-center gap-2"><MapPin className="h-4 w-4"/> Storefront Photo</p>
                                )}
                            </div>
                            <p className="text-sm text-muted-foreground flex items-center gap-2 mb-4">
                                <Navigation className="h-4 w-4"/> 
                                {selectedCustomer.address}
                            </p>
                            <DialogTrigger asChild>
                                <Button className="w-full mb-2" onClick={() => setCameraPurpose('storefront')}><Camera className="mr-2 h-4 w-4"/> Take Storefront Photo</Button>
                            </DialogTrigger>
                             <Button className="w-full" variant="outline" onClick={handlePinLocation}><MapPin className="mr-2 h-4 w-4"/> Pin Location</Button>
                        </CardContent>
                    </Card>
                </div>
                <div className="md:col-span-2">
                     <Card>
                        <CardContent className="p-6">
                            <Tabs defaultValue="notes">
                                <TabsList className="grid w-full grid-cols-4">
                                    <TabsTrigger value="notes"><StickyNote className="mr-2"/> Interactions</TabsTrigger>
                                    <TabsTrigger value="competitor"><Zap className="mr-2"/> Comp Act</TabsTrigger>
                                    <TabsTrigger value="order"><Package className="mr-2"/> Place Order</TabsTrigger>
                                    <TabsTrigger value="return"><Undo2 className="mr-2"/> Stock Return</TabsTrigger>
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
                                        <Separator className="my-4"/>
                                        <h3 className="font-semibold mb-2">Product Checklist</h3>
                                         <div className="relative mb-2">
                                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                type="search"
                                                placeholder="Search product list..."
                                                className="w-full pl-8 h-9"
                                                value={checklistProductSearch}
                                                onChange={(e) => setChecklistProductSearch(e.target.value)}
                                            />
                                        </div>
                                        <ScrollArea className="h-40 border rounded-md p-4">
                                            <div className="space-y-3">
                                                {filteredChecklistProducts.map(product => (
                                                     <div key={product.id} className="flex items-center space-x-2">
                                                        <Checkbox 
                                                            id={`product-${product.id}`} 
                                                            checked={productChecklist.get(product.id) || false}
                                                            onCheckedChange={(checked) => handleProductChecklistChange(product.id, !!checked)}
                                                        />
                                                        <Label htmlFor={`product-${product.id}`} className="font-normal cursor-pointer">{product.name}</Label>
                                                    </div>
                                                ))}
                                                {filteredChecklistProducts.length === 0 && <p className="text-muted-foreground text-sm text-center py-4">No products found.</p>}
                                            </div>
                                        </ScrollArea>
                                         <Separator className="my-4"/>
                                        <div className="flex gap-2">
                                            <Button size="sm" onClick={() => handleSaveNote('Meeting', noteText, setNoteText)}>Save Note</Button>
                                            <DialogTrigger asChild>
                                                <Button size="sm" variant="outline" onClick={() => setCameraPurpose('interaction')}>
                                                    <Camera className="mr-2 h-4 w-4"/>
                                                    Add Photo
                                                </Button>
                                            </DialogTrigger>
                                        </div>
                                    </div>
                                    <Separator className="my-6"/>
                                    <div>
                                        <h3 className="font-semibold mb-4">Past Interactions</h3>
                                        <div className="space-y-4">
                                            {customerInteractions.filter(i => i.type !== 'Competitor Activity').map(interaction => (
                                                <div key={interaction.id} className="text-sm">
                                                    <p className="font-medium">{format(new Date(interaction.date), "PPP")} - {interaction.type}</p>
                                                    <p className="text-muted-foreground whitespace-pre-wrap pl-2 border-l-2 ml-2 mt-1">{interaction.notes}</p>
                                                </div>
                                            ))}
                                             {customerInteractions.filter(i => i.type !== 'Competitor Activity').length === 0 && <p className="text-muted-foreground text-sm">No past interactions logged.</p>}
                                        </div>
                                    </div>
                                </TabsContent>
                                <TabsContent value="competitor">
                                     <div className="mt-4">
                                        <h3 className="font-semibold mb-2">Log Competitor Activity</h3>
                                        <Textarea 
                                          placeholder={`Add a note about competitor activity at ${selectedCustomer.name}...`} 
                                          className="mb-2"
                                          value={competitorNoteText}
                                          onChange={(e) => setCompetitorNoteText(e.target.value)}
                                        />
                                        <div className="flex gap-2">
                                            <Button size="sm" onClick={() => handleSaveNote('Competitor Activity', competitorNoteText, setCompetitorNoteText)}>Save Note</Button>
                                        </div>
                                    </div>
                                    <Separator className="my-6"/>
                                    <div>
                                        <h3 className="font-semibold mb-4">Past Competitor Activity</h3>
                                        <div className="space-y-4">
                                            {customerInteractions.filter(i => i.type === 'Competitor Activity').map(interaction => (
                                                <div key={interaction.id} className="text-sm">
                                                    <p className="font-medium">{format(new Date(interaction.date), "PPP")}</p>
                                                    <p className="text-muted-foreground pl-2 border-l-2 ml-2 mt-1">{interaction.notes}</p>
                                                </div>
                                            ))}
                                             {customerInteractions.filter(i => i.type === 'Competitor Activity').length === 0 && <p className="text-muted-foreground text-sm">No past competitor activity logged.</p>}
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
                                         {renderProductList(order, setOrder)}
                                         <Separator className="my-6"/>
                                         <Button className="w-full" onClick={handleSendToWhatsApp} disabled={order.size === 0}>
                                            <ShoppingCart className="mr-2 h-4 w-4" /> Send to WhatsApp & Save Order
                                         </Button>
                                    </div>
                                </TabsContent>
                                <TabsContent value="return">
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
                                         {renderProductList(stockReturnItems, setStockReturnItems)}
                                         <Separator className="my-6"/>
                                          <div className="space-y-2 mb-4">
                                            <Label htmlFor="return-reason">Reason for Return</Label>
                                            <Input 
                                                id="return-reason" 
                                                placeholder="e.g., Damaged, Expired" 
                                                value={stockReturnReason} 
                                                onChange={(e) => setStockReturnReason(e.target.value)} 
                                            />
                                        </div>
                                         <Button className="w-full" onClick={handleProcessReturn} disabled={stockReturnItems.size === 0}>
                                            <Undo2 className="mr-2 h-4 w-4" /> Process Return & Send Credit
                                         </Button>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                     </Card>
                </div>
            </div>
            <DialogContent className="max-w-3xl">
                <CameraCapture onCapture={handleSavePhoto} />
            </DialogContent>
        </Dialog>
      )}
       {!selectedCustomer && (
            <Card className="flex items-center justify-center h-96">
                <div className="text-center text-muted-foreground">
                     {isClient && mode === 'route' && todaysRoute.length > 0 && uncompletedRouteCustomers.length > 0 ? <p>Select a customer from your route to begin.</p> : null}
                     {isClient && mode === 'route' && todaysRoute.length === 0 ? <p>You have no customers planned for today.</p> : null}
                     {isClient && mode === 'route' && todaysRoute.length > 0 && uncompletedRouteCustomers.length === 0 ? <p>Congratulations! You've completed all calls for today.</p> : null}
                     {isClient && mode === 'all' && <p>Select a customer to begin.</p>}
                     {!isClient && <p>Loading route...</p>}
                </div>
            </Card>
        )}
    </div>
  );
}


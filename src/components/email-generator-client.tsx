"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generateEmailTemplateAction } from "@/lib/actions";
import { LoaderCircle, Wand2, Copy } from "lucide-react";
import type { Customer, Product } from "@/lib/data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useToast } from "@/hooks/use-toast";
import { useCustomers } from "@/context/customer-context";

const formSchema = z.object({
  customerId: z.string().min(1, "Please select a customer."),
  productId: z.string().min(1, "Please select a product."),
  pastOrders: z.string().min(1, "Past orders are required."),
  salesData: z.string().min(1, "Sales data is required."),
});

type EmailGeneratorClientProps = {
  products: Product[];
};

export default function EmailGeneratorClient({ products }: EmailGeneratorClientProps) {
  const { customers } = useCustomers();
  const [isLoading, setIsLoading] = useState(false);
  const [generatedEmail, setGeneratedEmail] = useState("");
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerId: "",
      productId: "",
      pastOrders: "Various cold cuts, cheeses, and olives.",
      salesData: "Customer prefers Italian meats, average order value is $150.",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setGeneratedEmail("");

    const customer = customers.find((c) => c.id === values.customerId);
    const product = products.find((p) => p.id === values.productId);

    if (!customer || !product) {
        toast({
            title: "Error",
            description: "Selected customer or product not found.",
            variant: "destructive",
        });
        setIsLoading(false);
        return;
    }

    try {
      const result = await generateEmailTemplateAction({
        customerName: customer.contactPerson,
        productName: product.name,
        productDescription: product.description,
        pastOrders: values.pastOrders,
        salesData: values.salesData,
      });
      setGeneratedEmail(result.emailTemplate);
    } catch (error) {
        toast({
            title: "Generation Failed",
            description: "Could not generate email template. Please try again.",
            variant: "destructive",
        });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedEmail);
    toast({
        title: "Copied!",
        description: "Email template copied to clipboard.",
    });
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Email Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="customerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a customer to target" />
                        </Trigger>
                      </FormControl>
                      <SelectContent>
                        {customers.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.name} - {c.contactPerson}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="productId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product to Promote</FormLabel>
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a product to promote" />
                        </Trigger>
                      </FormControl>
                      <SelectContent>
                        {products.map((p) => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="pastOrders"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer's Past Orders</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., Prosciutto, Salami, Olives" {...field} rows={3}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="salesData"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Relevant Sales Data/Notes</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., Prefers spicy items, high-value client" {...field} rows={3}/>
                    </FormControl>
                    <FormMessage />
                  </Now, when you import new customers on the "Customers" page, the list will be updated, and the "Route" page will automatically show the same, complete list of customers. Let me know if you have any other questions.
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="mr-2 h-4 w-4" />
                )}
                Generate Email
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Generated Email</CardTitle>
            {generatedEmail && (
                <Button variant="ghost" size="icon" onClick={handleCopy}>
                    <Copy className="h-4 w-4" />
                </Button>
            )}
        </CardHeader>
        <CardContent>
            {isLoading && (
                <div className="flex items-center justify-center h-full min-h-[300px]">
                    <div className="text-center text-muted-foreground">
                        <Wand2 className="mx-auto h-12 w-12 mb-4 animate-pulse" />
                        <p>Generating your personalized email...</p>
                    </div>
                </div>
            )}
            {generatedEmail && (
                <div className="prose prose-sm max-w-none rounded-md border bg-muted/30 p-4 whitespace-pre-wrap">
                    {generatedEmail}
                </div>
            )}
            {!isLoading && !generatedEmail && (
                 <div className="flex items-center justify-center h-full min-h-[300px]">
                    <div className="text-center text-muted-foreground">
                        <p>Your generated email will appear here.</p>
                    </div>
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}

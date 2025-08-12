import EmailGeneratorClient from "@/components/email-generator-client";
import { customers, products } from "@/lib/data";

export default function EmailGeneratorPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
          AI Email Template Generator
        </h2>
      </div>
      <p className="text-muted-foreground">
        Generate personalized email templates for customer outreach based on their sales history and product interests.
      </p>
      <EmailGeneratorClient customers={customers} products={products} />
    </div>
  );
}

'use server';

/**
 * @fileOverview Generates personalized email templates for sales representatives using AI.
 *
 * - generateEmailTemplate - A function that generates an email template based on customer data and past orders.
 * - GenerateEmailTemplateInput - The input type for the generateEmailTemplate function.
 * - GenerateEmailTemplateOutput - The return type for the generateEmailTemplate function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateEmailTemplateInputSchema = z.object({
  customerName: z.string().describe('The name of the customer.'),
  pastOrders: z.string().describe('Details of the customer\'s past orders.'),
  productName: z.string().describe('The name of the product to promote.'),
  productDescription: z.string().describe('A description of the product.'),
  salesData: z.string().describe('Relevant sales data or statistics.'),
});
export type GenerateEmailTemplateInput = z.infer<typeof GenerateEmailTemplateInputSchema>;

const GenerateEmailTemplateOutputSchema = z.object({
  emailTemplate: z.string().describe('The generated email template.'),
});
export type GenerateEmailTemplateOutput = z.infer<typeof GenerateEmailTemplateOutputSchema>;

export async function generateEmailTemplate(input: GenerateEmailTemplateInput): Promise<GenerateEmailTemplateOutput> {
  return generateEmailTemplateFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateEmailTemplatePrompt',
  input: {schema: GenerateEmailTemplateInputSchema},
  output: {schema: GenerateEmailTemplateOutputSchema},
  prompt: `You are an AI email assistant for generating personalized email templates for sales representatives.

  Based on the following customer data, past orders, product information, and sales data, generate a personalized email template to promote a specific product to the customer.

  Customer Name: {{{customerName}}}
  Past Orders: {{{pastOrders}}}
  Product Name: {{{productName}}}
  Product Description: {{{productDescription}}}
  Sales Data: {{{salesData}}}

  Write a professional and engaging email template that includes a personalized greeting, highlights the benefits of the product based on the customer's past orders, and includes a call to action. The email should be concise and easy to read.

  Email Template:`,
});

const generateEmailTemplateFlow = ai.defineFlow(
  {
    name: 'generateEmailTemplateFlow',
    inputSchema: GenerateEmailTemplateInputSchema,
    outputSchema: GenerateEmailTemplateOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

"use server";

import { generateEmailTemplate, type GenerateEmailTemplateInput, type GenerateEmailTemplateOutput } from "@/ai/flows/generate-email-template";

export async function generateEmailTemplateAction(
  input: GenerateEmailTemplateInput
): Promise<GenerateEmailTemplateOutput> {
  try {
    const output = await generateEmailTemplate(input);
    return output;
  } catch (error) {
    console.error("Error generating email template:", error);
    throw new Error("Failed to generate email template.");
  }
}

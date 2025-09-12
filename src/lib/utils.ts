import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Lead } from "@/types/entities";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const calculateLeadScore = (lead: Partial<Lead>): number => {
  let score = 0;
  if (lead.name) score += 1;
  if (lead.email) score += 1;
  if (lead.phone) score += 1;
  if (lead.source && lead.source !== "other") score += 1;
  if (lead.notes) score += 1;
  return score;
};

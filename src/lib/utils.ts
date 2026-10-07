import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(Math.round(num));
}

export function formatCost(cost: number): string {
  if (cost >= 1_000_000) {
    return `${(cost / 1_000_000).toFixed(1)}M`;
  }
  if (cost >= 1_000) {
    return `${(cost / 1_000).toFixed(1)}k`;
  }
  return cost.toLocaleString();
}

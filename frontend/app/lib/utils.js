import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge class names with tailwind-merge
 * @param  {...import('clsx').ClassValue[]} inputs 
 * @returns {string}
 */
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

/**
 * Format bytes to human readable string
 * @param {number} bytes 
 * @returns {string}
 */
export function formatSize(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

    // Determine the appropriate unit by calculating the log
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    // Format with 2 decimal places and round
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Generate a UUID
 * @returns {string}
 */
export const generateUUID = () => crypto.randomUUID();

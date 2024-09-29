import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const validateImage = (file: File): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      const isSquare = img.width === img.height;
      const isValidSize = img.width === 512 || img.width === 1024;
      const isUnder100kb = file.size <= 100 * 1024; // 100kb

      if (isSquare && isValidSize && isUnder100kb) {
        resolve(true);
      } else {
        resolve(false);
      }
    };
    img.onerror = () => reject(false);
  });
};

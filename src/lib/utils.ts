import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { v4 as uuid } from "@lukeed/uuid";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function newThreadLink(
  rootPath: string,
  agentId: string,
): `/${string}/${string}/chat/${string}?new=true` {
  return `/${rootPath}/${agentId}/chat/${uuid()}?new=true`;
}

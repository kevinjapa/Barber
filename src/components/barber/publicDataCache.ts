import type { Product, Service } from "./types";

type PublicBarber = {
  empid: number;
  name: string;
  last_name: string;
  photo_url?: string | null;
};

type CacheEntry<T> = {
  value: T;
};

const memoryCache = new Map<string, CacheEntry<unknown>>();
const pendingRequests = new Map<string, Promise<unknown>>();

async function getPublicData<T>(key: string, endpoint: string): Promise<T> {
  const memoryEntry = memoryCache.get(key) as CacheEntry<T> | undefined;
  if (memoryEntry) return memoryEntry.value;

  const pendingRequest = pendingRequests.get(key) as Promise<T> | undefined;
  if (pendingRequest) return pendingRequest;

  const request = fetch(endpoint)
    .then(async (response) => {
      if (!response.ok) throw new Error(`No se pudo cargar ${key}.`);
      const value = await response.json() as T;
      const entry = { value };
      memoryCache.set(key, entry);
      return value;
    })
    .finally(() => {
      pendingRequests.delete(key);
    });

  pendingRequests.set(key, request);
  return request;
}

export function getPublicServices() {
  return getPublicData<Service[]>("services", "/api/services");
}

export function getPublicProducts() {
  return getPublicData<Product[]>("products", "/api/products");
}

export function getPublicBarbers() {
  return getPublicData<PublicBarber[]>("barbers", "/api/public/employees");
}

export function clearPublicDataCache() {
  memoryCache.clear();
}

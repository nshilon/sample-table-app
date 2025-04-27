# DataTable with Generic Data Caching

This project demonstrates a reusable DataTable component with built-in state management and a generic data caching mechanism.

## Features

- Generic DataTable component with built-in state management
- Opt-in features: sorting, pagination, global filtering, column filtering
- Generic data caching mechanism that works with any entity type
- Prefetching of adjacent pages for smoother pagination

## Using the DataTable Component

The DataTable component provides built-in state management for:
- Sorting
- Pagination
- Global filtering
- Column filtering

You can enable or disable these features using the `features` prop:

```tsx
<PersonTable
  features={{
    enableSorting: true,
    enablePagination: true,
    enableGlobalFilter: true,
    enableColumnFilters: true,
    initialPageSize: 10,
    initialSorting: [{ id: 'first_name', desc: false }]
  }}
/>
```

## Using the Generic Data Cache

The generic data caching mechanism can be used with any entity type:

### 1. Create a data cache for your entity

```tsx
import { createDataCache } from './lib/dataCache';

// Create a cache for your entity type
const productCache = createDataCache<ProductResponse>(
  baseApiUrl,      // Base API URL
  'products',      // Endpoint
  'name'           // Field to use for global filtering
);
```

### 2. Create fetch functions using the cache

```tsx
// Function to fetch products using the generic cache
export const fetchProducts = async (options: Options): Promise<ProductResponse> => {
  return productCache.fetchData(options);
};

// Function to prefetch adjacent pages
export const prefetchAdjacentPages = (currentOptions: Options) => {
  productCache.prefetchAdjacentPages(currentOptions);
};

// Function to prefetch initial data
export const prefetchInitialData = () => {
  return productCache.prefetchInitialData({
    sorting: [{ id: 'name', desc: false }]
  });
};
```

### 3. Use the fetch functions with your table component

```tsx
<ProductTable
  features={{
    enableSorting: true,
    enablePagination: true,
    enableGlobalFilter: true,
    enableColumnFilters: true
  }}
/>
```

## Advanced Cache Features

The data cache provides additional methods:

- `clearCache()` - Clear the entire cache
- `invalidateCache(options)` - Remove a specific entry from the cache
- `prefetchAdjacentPages(options)` - Prefetch adjacent pages for smoother pagination
- `prefetchInitialData(initialOptions)` - Prefetch initial data with optional settings

## Example

See `AppWithMultipleTables.tsx` for an example of using multiple tables with different entity types, all using the same generic caching mechanism.

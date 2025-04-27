# DataTable Component Documentation

This documentation provides a comprehensive guide to using the DataTable component and its related APIs. The DataTable is a flexible, reusable component that supports sorting, pagination, filtering, and other common data table features.

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Component API](#component-api)
- [DataProvider Pattern](#dataprovider-pattern)
- [Data Caching](#data-caching)
- [Column Configuration](#column-configuration)
- [Usage Examples](#usage-examples)
- [Advanced Features](#advanced-features)

## Overview

The DataTable component is a generic, reusable component that provides a flexible way to display tabular data with built-in state management. It follows the Inversion of Control (IoC) principle by delegating data operations to a DataProvider implementation, which handles data fetching, extraction, and state management.

## Key Features

- **Generic Implementation**: Works with any data type
- **Built-in State Management**: Handles sorting, pagination, filtering, and more
- **Opt-in Features**: Enable or disable features like sorting, pagination, global filtering, and column filtering
- **Data Provider Pattern**: Follows IoC principles for data operations
- **Generic Data Caching**: Efficient data caching mechanism that works with any entity type
- **Prefetching**: Support for prefetching adjacent pages for smoother pagination

## Component API

### DataTable Component

```tsx
<DataTable<TData, TResponse>
    columns={columns}
    options={options}
    dataProvider={dataProvider}
    features={features}
    children={children}
/>
```

#### Generic Type Parameters

- `TData`: The type of data items displayed in the table
- `TResponse`: The type of the API response containing the data

#### Props

| Prop | Type | Description | Required |
|------|------|-------------|----------|
| `columns` | `ExtendedColumnDef<TData, any>[]` | Column definitions for the table | Yes |
| `options` | `TableOptions` | Table options including sorting, pagination, filters | No |
| `dataProvider` | `DataProvider<TData, TResponse>` | Implementation of the DataProvider interface | Yes |
| `features` | `DataTableFeatures` | Feature flags to enable/disable table features | No |
| `children` | `React.ReactNode` | Additional content to render within the table | No |

### TableOptions Type

```tsx
export type TableOptions = {
    sorting?: TableSortingState;
    pagination?: PaginationState;
    columnFilters?: ColumnFiltersState;
    globalFilter?: string;
};
```

### DataTableFeatures Type

```tsx
export type DataTableFeatures = {
    enableSorting?: boolean;
    enablePagination?: boolean;
    enableGlobalFilter?: boolean;
    enableColumnFilters?: boolean;
    initialPageSize?: number;
    initialSorting?: TableSortingState;
};
```

Default values:
```tsx
{
    enableSorting: true,
    enablePagination: true,
    enableGlobalFilter: true,
    enableColumnFilters: true,
    initialPageSize: 10,
    initialSorting: []
}
```

## DataProvider Pattern

The DataProvider pattern follows the Inversion of Control (IoC) principle, where the DataTable component delegates data operations to a DataProvider implementation.

### DataProvider Interface

```tsx
export interface DataProvider<TData, TResponse> {
    fetchData(options: TableOptions): Promise<TResponse>;
    getRowData(response: TResponse): TData[];
    getRowCount(response: TResponse): number;
    getPageCount(response: TResponse): number;
    getInitialData(): TResponse;
    prefetchAdjacentPages?(options: TableOptions): void;
}
```

#### Methods

| Method | Description |
|--------|-------------|
| `fetchData` | Fetches data based on the provided options |
| `getRowData` | Extracts the row data from the response |
| `getRowCount` | Gets the total count of rows from the response |
| `getPageCount` | Gets the total number of pages from the response |
| `getInitialData` | Gets the initial data to display before any fetching occurs |
| `prefetchAdjacentPages` | Optional method to prefetch adjacent pages for smoother pagination |

### BaseDataProvider

The `BaseDataProvider` is an abstract class that provides a base implementation of the `DataProvider` interface. It uses a `DataCache` instance to handle data fetching and caching.

```tsx
export abstract class BaseDataProvider<TData, TResponse> implements DataProvider<TData, TResponse> {
    protected dataCache: DataCache<TResponse>;
    protected initialData: TResponse;
    
    constructor(dataCache: DataCache<TResponse>, initialData: TResponse) {
        this.dataCache = dataCache;
        this.initialData = initialData;
    }
    
    fetchData(options: TableOptions): Promise<TResponse> {
        return this.dataCache.fetchData(options as FetchOptions);
    }
    
    getInitialData(): TResponse {
        return this.initialData;
    }
    
    prefetchAdjacentPages(options: TableOptions): void {
        this.dataCache.prefetchAdjacentPages(options as FetchOptions);
    }
    
    abstract getRowData(response: TResponse): TData[];
    abstract getRowCount(response: TResponse): number;
    abstract getPageCount(response: TResponse): number;
}
```

When extending `BaseDataProvider`, you must implement the following abstract methods:
- `getRowData`: Extract row data from the response
- `getRowCount`: Get the total count of rows from the response
- `getPageCount`: Get the total number of pages from the response

## Data Caching

The DataTable component uses a generic data caching mechanism that can be used with any entity type.

### DataCache Class

```tsx
export class DataCache<T> {
    constructor(
        baseUrl: string, 
        endpoint: string, 
        globalFilterField?: string
    ) { ... }
    
    getCacheKey(options: FetchOptions): string { ... }
    async fetchData(options: FetchOptions): Promise<T> { ... }
    prefetchAdjacentPages(options: FetchOptions): void { ... }
    prefetchInitialData(initialOptions: Partial<FetchOptions> = {}): Promise<T> { ... }
    clearCache(): void { ... }
    invalidateCache(options: FetchOptions): void { ... }
}
```

#### Methods

| Method | Description |
|--------|-------------|
| `getCacheKey` | Generates a cache key from the provided options |
| `fetchData` | Fetches data with caching |
| `prefetchAdjacentPages` | Prefetches adjacent pages for smoother pagination |
| `prefetchInitialData` | Prefetches initial data with default settings |
| `clearCache` | Clears the entire cache |
| `invalidateCache` | Removes a specific entry from the cache |

### Creating a DataCache

You can create a data cache using the `createDataCache` factory function:

```tsx
import { createDataCache } from './lib/dataCache';

const productCache = createDataCache<ProductResponse>(
    baseApiUrl,      // Base API URL
    'products',      // Endpoint
    'name'           // Field to use for global filtering
);
```

## Column Configuration

Columns are defined using the `ExtendedColumnDef` type, which extends the `ColumnDef` type from `@tanstack/react-table` with additional meta properties.

### ExtendedColumnDef Type

```tsx
export type ExtendedColumnDef<TData, TValue> = ColumnDef<TData, TValue> & {
    meta?: ColumnMeta<TData>;
};

type ColumnMeta<TData> = {
    filterComponent?: (column: Column<TData, any>) => JSX.Element;
};
```

### Example Column Definition

```tsx
const productColumns: ExtendedColumnDef<Product, any>[] = [
    {
        accessorKey: "name",
        header: "Product Name",
        cell: info => info.getValue(),
        meta: {
            filterComponent: (column) => (
                <input
                    type="text"
                    value={(column.getFilterValue() as string) ?? ''}
                    onChange={e => column.setFilterValue(e.target.value)}
                    placeholder="Filter by name..."
                    className="w-full"
                />
            )
        }
    },
    {
        accessorKey: "category",
        header: "Category",
        cell: info => info.getValue()
    },
    {
        accessorKey: "price",
        header: "Price",
        cell: info => `$${info.getValue()}`
    }
];
```

## Usage Examples

### Basic Usage

```tsx
import { DataTable } from "./DataTable";
import { ProductDataProvider } from "./providers/ProductDataProvider";
import { productColumns } from "./columns/productColumns";

export function ProductTable() {
    // Create a data provider
    const dataProvider = new ProductDataProvider('https://api.example.com');
    
    return (
        <DataTable<Product, ProductResponse>
            columns={productColumns}
            dataProvider={dataProvider}
            features={{
                enableSorting: true,
                enablePagination: true,
                enableGlobalFilter: true,
                enableColumnFilters: true,
                initialPageSize: 10,
                initialSorting: [{ id: 'name', desc: false }]
            }}
        />
    );
}
```

### Creating a Custom DataProvider

```tsx
import { BaseDataProvider } from "./lib/baseDataProvider";
import { Product, ProductResponse } from "./ProductTable";
import { createDataCache } from "./lib/dataCache";

export class ProductDataProvider extends BaseDataProvider<Product, ProductResponse> {
    constructor(baseApiUrl: string) {
        // Create a product-specific data cache
        const productCache = createDataCache<ProductResponse>(baseApiUrl, 'products', 'name');
        super(productCache, initialProductResponse);
    }
    
    getRowData(response: ProductResponse): Product[] {
        return response.data;
    }
    
    getRowCount(response: ProductResponse): number {
        return response.items;
    }
    
    getPageCount(response: ProductResponse): number {
        return response.pages;
    }
}
```

## Advanced Features

### Prefetching Adjacent Pages

The DataCache class provides a method to prefetch adjacent pages for smoother pagination:

```tsx
dataCache.prefetchAdjacentPages({
    pagination: { pageIndex: 1, pageSize: 10 },
    sorting: [{ id: 'name', desc: false }]
});
```

### Custom Initial Data

You can provide custom initial data when creating a DataProvider:

```tsx
const initialProductResponse: ProductResponse = {
    first: 0,
    prev: 0,
    next: 0,
    last: 0,
    pages: 0,
    items: 0,
    data: []
};

export class ProductDataProvider extends BaseDataProvider<Product, ProductResponse> {
    constructor(baseApiUrl: string) {
        const productCache = createDataCache<ProductResponse>(baseApiUrl, 'products', 'name');
        super(productCache, initialProductResponse);
    }
    // ...
}
```

### Invalidating Cache

You can invalidate specific cache entries when data changes:

```tsx
// After adding a new product
dataProvider.dataCache.invalidateCache({
    pagination: { pageIndex: 0, pageSize: 10 },
    sorting: [{ id: 'name', desc: false }]
});
```

### Clearing the Entire Cache

```tsx
dataProvider.dataCache.clearCache();
```

### Custom Filtering

You can implement custom filtering by providing filter components in the column meta:

```tsx
{
    accessorKey: "category",
    header: "Category",
    cell: info => info.getValue(),
    meta: {
        filterComponent: (column) => (
            <select
                value={(column.getFilterValue() as string) ?? ''}
                onChange={e => column.setFilterValue(e.target.value)}
                className="w-full"
            >
                <option value="">All</option>
                <option value="Electronics">Electronics</option>
                <option value="Clothing">Clothing</option>
                <option value="Food">Food</option>
            </select>
        )
    }
}
```

## Conclusion

This documentation provides a comprehensive guide to using the DataTable component and its related APIs. 

For more specific use cases or advanced configurations, refer to the source code or contact the [development team](mailto:nir.shilon@sapiens.com).

# DataTable Component - Comprehensive Developer Guide

This guide provides a detailed overview of the DataTable component, its architecture, API, and best practices for implementation. The DataTable is a flexible, reusable component built on top of [@tanstack/react-table](https://tanstack.com/table/latest) that provides built-in state management for common features like sorting, pagination, and filtering.

## Table of Contents

- [Introduction](#introduction)
- [Architecture Overview](#architecture-overview)
- [Component API Reference](#component-api-reference)
- [DataProvider Pattern](#dataprovider-pattern)
- [Data Caching Mechanism](#data-caching-mechanism)
- [Column Configuration](#column-configuration)
- [Filtering Capabilities](#filtering-capabilities)
- [Sorting Implementation](#sorting-implementation)
- [Pagination Controls](#pagination-controls)
- [Usage Examples](#usage-examples)
- [Advanced Customization](#advanced-customization)
- [Performance Optimization](#performance-optimization)
- [TypeScript Integration](#typescript-integration)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)
- [Migration Guide](#migration-guide)

## Introduction

The DataTable component is designed to provide a generic, reusable solution for displaying tabular data with built-in state management. It follows the Inversion of Control (IoC) principle by delegating data operations to a DataProvider implementation, which handles data fetching, extraction, and state management.

### Key Features

- **Generic Implementation**: Works with any data type through TypeScript generics
- **Built-in State Management**: Handles sorting, pagination, filtering, and more
- **Opt-in Features**: Enable or disable features like sorting, pagination, global filtering, and column filtering
- **Data Provider Pattern**: Follows IoC principles for data operations
- **Generic Data Caching**: Efficient data caching mechanism that works with any entity type
- **Prefetching**: Support for prefetching adjacent pages for smoother pagination
- **Custom Column Filters**: Support for custom filter components per column

## Architecture Overview

The DataTable component architecture consists of several key parts:

1. **DataTable Component**: The main component that renders the table and manages state
2. **DataProvider Interface**: Defines the contract for data operations
3. **BaseDataProvider**: Abstract class that provides a base implementation of the DataProvider interface
4. **DataCache**: Generic class for efficient data fetching and caching
5. **DataTablePagination**: Component for rendering pagination controls
6. **ExtendedColumnDef**: Extended column definition type with support for custom filter components

### Component Interaction Flow

1. User interacts with the table (sorting, filtering, pagination)
2. DataTable updates its internal state
3. DataTable calls the DataProvider to fetch data based on the new state
4. DataProvider uses DataCache to fetch and cache data
5. DataTable renders the new data

## Component API Reference

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

### Generic Type Parameters

- `TData`: The type of data items displayed in the table
- `TResponse`: The type of the API response containing the data

### Props

| Prop | Type | Description | Required | Default |
|------|------|-------------|----------|---------|
| `columns` | `ExtendedColumnDef<TData, any>[]` | Column definitions for the table | Yes | - |
| `options` | `TableOptions` | Table options including sorting, pagination, filters | No | `{}` |
| `dataProvider` | `DataProvider<TData, TResponse>` | Implementation of the DataProvider interface | Yes | - |
| `features` | `DataTableFeatures` | Feature flags to enable/disable table features | No | See below |
| `children` | `React.ReactNode` | Additional content to render within the table | No | `undefined` |

### Default Features

```tsx
{
    enableSorting: true,
    enablePagination: true,
    enableGlobalFilter: true,
    enableColumnFilters: true
}
```

### TableOptions Type

```tsx
export type TableOptions = {
    sorting?: SortingState;
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
};
```

## DataProvider Pattern

The DataProvider pattern follows the Inversion of Control (IoC) principle, where the DataTable component delegates data operations to a DataProvider implementation.

### DataProvider Interface

```tsx
export interface DataProvider<TData, TResponse> {
    /**
     * Fetches data based on the provided options
     */
    fetchData(options: TableOptions): Promise<TResponse>;

    /**
     * Extracts the row data from the response
     */
    getRowData(response: TResponse): TData[];

    /**
     * Gets the total count of rows from the response
     */
    getRowCount(response: TResponse): number;

    /**
     * Gets the total number of pages from the response
     */
    getPageCount(response: TResponse): number;

    /**
     * Gets the initial data to display before any fetching occurs
     */
    getInitialData(): TResponse;

    /**
     * Optional method to prefetch adjacent pages for smoother pagination
     */
    prefetchAdjacentPages?(options: TableOptions): void;
}
```

### BaseDataProvider Abstract Class

The BaseDataProvider abstract class provides a base implementation of the DataProvider interface that uses a DataCache for efficient data fetching and caching.

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
    
    // Abstract methods that must be implemented by concrete providers
    abstract getRowData(response: TResponse): TData[];
    abstract getRowCount(response: TResponse): number;
    abstract getPageCount(response: TResponse): number;
}
```

### Creating a Custom DataProvider

To create a custom DataProvider, extend the BaseDataProvider class and implement the abstract methods:

```tsx
export class ProductDataProvider extends BaseDataProvider<Product, ProductResponse> {
    constructor(baseApiUrl: string) {
        // Create a product-specific data cache
        const productCache = createDataCache<ProductResponse>(
            baseApiUrl,
            "products",
            "name"
        );
        super(productCache, initialProductResponse);
    }
    
    getRowData(response: ProductResponse): Product[] {
        return response.data;
    }
    
    getRowCount(response: ProductResponse): number {
        return response.totalCount;
    }
    
    getPageCount(response: ProductResponse): number {
        return response.pageCount;
    }
}
```

## Data Caching Mechanism

The DataTable component uses a generic data caching mechanism that can be used with any entity type.

### DataCache Class

```tsx
export class DataCache<T> {
    private cache = new Map<string, Promise<T>>();
    private endpoint: string;
    private baseUrl: string;
    private globalFilterField?: string;
    
    constructor(baseUrl: string, endpoint: string, globalFilterField?: string) {
        this.baseUrl = baseUrl;
        this.endpoint = endpoint;
        this.globalFilterField = globalFilterField;
    }
    
    // Generate a cache key from options
    getCacheKey(options: FetchOptions): string { ... }
    
    // Fetch data with caching
    async fetchData(options: FetchOptions): Promise<T> { ... }
    
    // Prefetch adjacent pages for smoother pagination
    prefetchAdjacentPages(options: FetchOptions): void { ... }
    
    // Prefetch initial data
    prefetchInitialData(initialOptions: Partial<FetchOptions> = {}): Promise<T> { ... }
    
    // Clear the entire cache
    clearCache(): void { ... }
    
    // Remove a specific entry from the cache
    invalidateCache(options: FetchOptions): void { ... }
}
```

### Creating a DataCache

```tsx
import { createDataCache } from './lib/dataCache';

// Create a cache for your entity type
const productCache = createDataCache<ProductResponse>(
    baseApiUrl,      // Base API URL
    'products',      // Endpoint
    'name'           // Field to use for global filtering
);
```

### Cache Key Generation

The DataCache generates cache keys based on the provided options:

```tsx
getCacheKey(options: FetchOptions): string {
    const sortKey = options.sorting && options.sorting.length > 0
        ? options.sorting.map((s) => `${s.id}:${s.desc}`).join(",")
        : "";

    const pageKey = options.pagination
        ? `page=${options.pagination.pageIndex},size=${options.pagination.pageSize}`
        : "page=0,size=10";

    const filterKey = options.globalFilter || "";

    const columnFilterKey = options.columnFilters && options.columnFilters.length > 0
        ? options.columnFilters.map((f) => `${f.id}:${f.value}`).join(",")
        : "";

    // Include any custom options in the cache key
    const customKeys = Object.entries(options)
        .filter(([key]) => !["sorting", "pagination", "columnFilters", "globalFilter"].includes(key))
        .map(([key, value]) => `${key}:${JSON.stringify(value)}`)
        .join("|");

    return `${this.endpoint}|${sortKey}|${pageKey}|${filterKey}|${columnFilterKey}${customKeys ? "|" + customKeys : ""}`;
}
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
        enableSorting: true,
        cell: info => info.getValue(),
        meta: {
            filterComponent: (column) => (
                <input
                    type="search"
                    onChange={debounce(
                        (e: ChangeEvent<HTMLInputElement>) =>
                            column.setFilterValue(e.target.value),
                        500
                    )}
                    placeholder="Filter by name..."
                />
            )
        }
    },
    {
        accessorKey: "category",
        header: "Category",
        enableSorting: true,
        cell: info => info.getValue()
    },
    {
        accessorKey: "price",
        header: "Price",
        enableSorting: true,
        cell: info => `$${info.getValue()}`
    }
];
```

### Column Properties

| Property | Type | Description |
|----------|------|-------------|
| `accessorKey` | `string` | The key to access the data in the row |
| `header` | `string` | The header text for the column |
| `enableSorting` | `boolean` | Whether the column is sortable |
| `cell` | `(info: CellContext<TData, TValue>) => React.ReactNode` | Function to render the cell content |
| `meta` | `ColumnMeta<TData>` | Additional metadata for the column |

## Filtering Capabilities

The DataTable component supports two types of filtering:

1. **Global Filtering**: Filters all columns based on a single search term
2. **Column Filtering**: Filters individual columns based on column-specific criteria

### Global Filtering

Global filtering is enabled by default and can be controlled using the `enableGlobalFilter` feature flag:

```tsx
<DataTable<Product, ProductResponse>
    columns={productColumns}
    dataProvider={dataProvider}
    features={{
        enableGlobalFilter: true
    }}
/>
```

The global filter input is rendered at the top of the table:

```tsx
{features.enableGlobalFilter && (
    <div style={{marginBottom: "1rem"}}>
        <input
            placeholder="Search..."
            type="search"
            value={options?.globalFilter || globalFilter}
            onChange={(e) => {
                const value = e.target.value;
                handleGlobalFilterChange(value);
            }}
            style={{
                padding: "0.5rem",
                borderRadius: "4px",
                border: "1px solid #ccc",
                width: "100%",
                maxWidth: "300px",
            }}
        />
    </div>
)}
```

### Column Filtering

Column filtering is enabled by default and can be controlled using the `enableColumnFilters` feature flag:

```tsx
<DataTable<Product, ProductResponse>
    columns={productColumns}
    dataProvider={dataProvider}
    features={{
        enableColumnFilters: true
    }}
/>
```

Custom filter components can be provided for each column using the `meta.filterComponent` property:

```tsx
{
    accessorKey: "category",
    header: "Category",
    enableSorting: true,
    meta: {
        filterComponent: (column) => (
            <select
                onChange={(e) => column.setFilterValue(e.target.value)}
                value={(column.getFilterValue() as string) ?? ""}
            >
                <option value="">All</option>
                <option value="electronics">Electronics</option>
                <option value="clothing">Clothing</option>
                <option value="food">Food</option>
            </select>
        )
    }
}
```

### Debounced Filtering

To prevent excessive API calls during filtering, you can use the `debounce` utility:

```tsx
import { debounce } from "@/lib/utils";

meta: {
    filterComponent: (column) => (
        <input
            type="search"
            onChange={debounce(
                (e: ChangeEvent<HTMLInputElement>) =>
                    column.setFilterValue(e.target.value),
                500
            )}
            placeholder="Filter..."
        />
    )
}
```

## Sorting Implementation

Sorting is enabled by default and can be controlled using the `enableSorting` feature flag:

```tsx
<DataTable<Product, ProductResponse>
    columns={productColumns}
    dataProvider={dataProvider}
    features={{
        enableSorting: true
    }}
/>
```

Individual columns can be made sortable using the `enableSorting` property:

```tsx
{
    accessorKey: "name",
    header: "Product Name",
    enableSorting: true,
    cell: info => info.getValue()
}
```

The DataTable component supports multi-column sorting with a maximum of 3 columns by default:

```tsx
if (features.enableSorting) {
    deepMerge(baseTableOptions, {
        enableSorting: true,
        manualSorting: true,
        maxMultiSortColCount: 3,
        state: {
            sorting
        },
        onSortingChange: handleSortingChange,
    });
}
```

## Pagination Controls

Pagination is enabled by default and can be controlled using the `enablePagination` feature flag:

```tsx
<DataTable<Product, ProductResponse>
    columns={productColumns}
    dataProvider={dataProvider}
    features={{
        enablePagination: true
    }}
/>
```

The DataTablePagination component is used to render pagination controls:

```tsx
{features.enablePagination && (
    <tr>
        <td colSpan={columns.length}>
            <DataTablePagination table={table}/>
        </td>
    </tr>
)}
```

The DataTablePagination component provides the following controls:

- First page button
- Previous page button
- Page information (current page, total pages, total items)
- Next page button
- Last page button

```tsx
export function DataTablePagination<TData>({
    table,
}: {
    table: Table<TData>;
}) {
    return (
        <>
            <Button
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
            >
                {"<<"}
            </Button>
            <Button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
            >
                {"<"}
            </Button>
            <small>
                page {table.getState().pagination.pageIndex + 1} of{" "}
                {table.options.pageCount} pages, total items {table.options.rowCount}
            </small>
            <Button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
            >
                {">"}
            </Button>
            <Button
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
            >
                {">>"}
            </Button>
        </>
    );
}
```

## Usage Examples

### Basic Usage

```tsx
import { DataTable } from "@/components/data-table";
import { ProductDataProvider } from "./ProductDataProvider";
import { productColumns } from "./productColumns";

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
                enableColumnFilters: true
            }}
        />
    );
}
```

### Creating a Reusable Table Component

```tsx
import { DataTable, type ExtendedColumnDef, type TableOptions } from "@/components/data-table";
import { useMemo } from "react";
import { ProductDataProvider } from "./ProductDataProvider";
import { productColumns } from "./productColumns";
import type { Product, ProductResponse } from "./types";

const baseApiUrl = import.meta.env.VITE_API_URL;

export const ProductTable = ({
    options,
    features,
    children,
}: {
    options?: TableOptions;
    features?: {
        enableSorting?: boolean;
        enablePagination?: boolean;
        enableGlobalFilter?: boolean;
        enableColumnFilters?: boolean;
        initialPageSize?: number;
    };
    children?: React.ReactNode;
}) => {
    // Create the data provider
    const dataProvider = useMemo(() => {
        return new ProductDataProvider(baseApiUrl);
    }, []);

    return (
        <DataTable<Product, ProductResponse>
            columns={productColumns}
            options={options}
            dataProvider={dataProvider}
            features={features}
        >
            {children}
        </DataTable>
    );
};
```

### Custom Column Filters

```tsx
import { debounce } from "@/lib/utils";
import { type ChangeEvent } from "react";

const columns = [
    {
        accessorKey: "name",
        header: "Name",
        enableSorting: true,
        meta: {
            filterComponent: (column) => (
                <input
                    type="search"
                    onChange={debounce(
                        (e: ChangeEvent<HTMLInputElement>) =>
                            column.setFilterValue(e.target.value),
                        500
                    )}
                    placeholder="Filter by name..."
                />
            )
        }
    },
    {
        accessorKey: "category",
        header: "Category",
        enableSorting: true,
        meta: {
            filterComponent: (column) => (
                <select
                    onChange={(e) => column.setFilterValue(e.target.value)}
                    value={(column.getFilterValue() as string) ?? ""}
                >
                    <option value="">All</option>
                    <option value="electronics">Electronics</option>
                    <option value="clothing">Clothing</option>
                    <option value="food">Food</option>
                </select>
            )
        }
    }
];
```

## Advanced Customization

### Custom Table Actions

You can add custom actions to the table using the `children` prop:

```tsx
<ProductTable>
    <div className="flex justify-end gap-2 p-4">
        <Button onClick={handleExport}>Export to CSV</Button>
        <Button onClick={handleRefresh}>Refresh Data</Button>
    </div>
</ProductTable>
```

### Custom Cell Rendering

You can customize cell rendering using the `cell` property:

```tsx
{
    accessorKey: "status",
    header: "Status",
    cell: (info) => {
        const status = info.getValue() as string;
        return (
            <div className={`status-badge status-${status.toLowerCase()}`}>
                {status}
            </div>
        );
    }
}
```

### Custom Header Rendering

You can customize header rendering using the `header` property:

```tsx
{
    accessorKey: "price",
    header: () => (
        <div className="flex items-center">
            <span>Price</span>
            <InfoTooltip content="Price in USD" />
        </div>
    ),
    cell: (info) => `$${info.getValue()}`
}
```

## Performance Optimization

### Deferred Values

The DataTable component uses `useDeferredValue` to prevent UI flickering during data loading:

```tsx
// Apply deferred value to the current data to avoid flickering
const deferredData = useDeferredValue(currentData);

// Extract data from the response using the dataProvider
const data = dataProvider.getRowData(deferredData);
const rowCount = dataProvider.getRowCount(deferredData);
const pageCount = dataProvider.getPageCount(deferredData);
```

### Transitions

The DataTable component uses `useTransition` to mark data fetching as a non-urgent update:

```tsx
// Use transition to avoid showing the Suspense fallback during transitions
const [isPending, startTransition] = useTransition();

// Use effect to fetch data and update state
useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
        try {
            // Start transition to mark this update as non-urgent
            startTransition(async () => {
                const dataPromise = getCurrentData();
                const result = await dataPromise;
                if (isMounted) {
                    setCurrentData(result);
                }
            });
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    fetchData();

    return () => {
        isMounted = false;
    };
}, [options, pagination, sorting, globalFilter, columnFilters, dataProvider]);
```

### Debounced Filtering

To prevent excessive API calls during filtering, use the `debounce` utility:

```tsx
import { debounce } from "@/lib/utils";

meta: {
    filterComponent: (column) => (
        <input
            type="search"
            onChange={debounce(
                (e: ChangeEvent<HTMLInputElement>) =>
                    column.setFilterValue(e.target.value),
                500
            )}
            placeholder="Filter..."
        />
    )
}
```

### Memoization

Use `useMemo` to create the DataProvider to prevent unnecessary re-creation:

```tsx
const dataProvider = useMemo(() => {
    return new ProductDataProvider(baseApiUrl);
}, []);
```

## TypeScript Integration

The DataTable component is fully typed using TypeScript generics:

```tsx
<DataTable<Product, ProductResponse>
    columns={productColumns}
    dataProvider={dataProvider}
    features={features}
/>
```

### Type Definitions

```tsx
// Define your data types
export interface Product {
    id: number;
    name: string;
    category: string;
    price: number;
    stock: number;
    description: string;
}

export interface ProductResponse {
    data: Product[];
    totalCount: number;
    pageCount: number;
}

// Define your column types
const productColumns: ExtendedColumnDef<Product, any>[] = [
    // ...
];

// Create a typed DataProvider
export class ProductDataProvider extends BaseDataProvider<Product, ProductResponse> {
    // ...
}
```

## Best Practices

### Performance Optimization

1. **Use Deferred Values**: The DataTable component uses `useDeferredValue` to prevent UI flickering during data loading.

2. **Debounce Filter Inputs**: Always debounce filter inputs to prevent excessive API calls.

3. **Memoize DataProvider**: Use `useMemo` to create the DataProvider to prevent unnecessary re-creation.

4. **Enable Prefetching**: Use the prefetching feature to load adjacent pages for smoother pagination.

### Type Safety

1. **Define Response Types**: Always define proper types for your API responses.

2. **Use Generic Type Parameters**: Leverage the generic type parameters of the DataTable component for type safety.

```tsx
<DataTable<Product, ProductResponse>
    columns={productColumns}
    dataProvider={dataProvider}
    features={features}
/>
```

### Error Handling

1. **Handle API Errors**: Implement proper error handling in your DataProvider implementation.

2. **Provide Fallback UI**: Use React's error boundaries to provide a fallback UI in case of errors.

### Code Organization

1. **Separate Column Definitions**: Define columns in a separate file for better organization.

2. **Create Reusable Table Components**: Create reusable table components for different entity types.

3. **Use DataProvider Pattern**: Follow the DataProvider pattern for better separation of concerns.

## Troubleshooting

### Common Issues

1. **Table Not Updating**: Ensure that your DataProvider correctly implements all required methods.

2. **Filtering Not Working**: Check that your column definitions have the correct `enableFiltering` and `meta.filterComponent` properties.

3. **Pagination Issues**: Verify that your DataProvider correctly implements `getRowCount` and `getPageCount` methods.

4. **Sorting Not Working**: Ensure that your columns have `enableSorting: true` and your DataProvider handles sorting parameters correctly.

### Debugging Tips

1. **Check Console Errors**: Look for any errors in the browser console.

2. **Inspect Network Requests**: Use the browser's network tab to inspect API requests and responses.

3. **Log DataProvider Methods**: Add console logs to your DataProvider methods to debug data flow.

4. **Verify Cache Keys**: Check that your cache keys are generated correctly for different table states.

## Migration Guide

### Migrating from v1.x to v2.x

1. **Update DataProvider Interface**: Implement the new `prefetchAdjacentPages` method.

2. **Update Column Definitions**: Use the new `ExtendedColumnDef` type instead of the old `ColumnDef` type.

3. **Update Feature Flags**: Use the new `DataTableFeatures` type instead of the old feature flags.

4. **Update DataCache Usage**: Use the new `createDataCache` factory function instead of creating DataCache instances directly.

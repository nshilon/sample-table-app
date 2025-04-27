# DataProvider Pattern Guide

This guide provides a detailed explanation of the DataProvider pattern used in the DataTable component, including its purpose, implementation, and best practices.

## Table of Contents

- [Introduction](#introduction)
- [DataProvider Interface](#dataprovider-interface)
- [BaseDataProvider Abstract Class](#basedataprovider-abstract-class)
- [Creating Custom DataProviders](#creating-custom-dataproviders)
- [Integration with DataCache](#integration-with-datacache)
- [Advanced Usage](#advanced-usage)
- [Best Practices](#best-practices)
- [Examples](#examples)

## Introduction

The DataProvider pattern is an implementation of the Inversion of Control (IoC) principle, where the DataTable component delegates data operations to a DataProvider implementation. This separation of concerns allows for:

1. **Flexibility**: Different data sources can be used with the same DataTable component
2. **Reusability**: DataProviders can be reused across different components
3. **Testability**: DataProviders can be easily mocked for testing
4. **Maintainability**: Changes to data fetching logic don't require changes to the DataTable component

## DataProvider Interface

The DataProvider interface defines the contract for data operations used by the DataTable component:

```tsx
export interface DataProvider<TData, TResponse> {
    /**
     * Fetches data based on the provided options
     *
     * @param options Table options including sorting, pagination, filters, etc.
     * @returns Promise resolving to the response data
     */
    fetchData(options: TableOptions): Promise<TResponse>;

    /**
     * Extracts the row data from the response
     *
     * @param response The API response
     * @returns Array of data items
     */
    getRowData(response: TResponse): TData[];

    /**
     * Gets the total count of rows from the response
     *
     * @param response The API response
     * @returns Total number of items
     */
    getRowCount(response: TResponse): number;

    /**
     * Gets the total number of pages from the response
     *
     * @param response The API response
     * @returns Total number of pages
     */
    getPageCount(response: TResponse): number;

    /**
     * Gets the initial data to display before any fetching occurs
     *
     * @returns The initial response data
     */
    getInitialData(): TResponse;

    /**
     * Optional method to prefetch adjacent pages for smoother pagination
     *
     * @param options Current table options
     */
    prefetchAdjacentPages?(options: TableOptions): void;
}
```

### Generic Type Parameters

- `TData`: The type of data items displayed in the table
- `TResponse`: The type of the API response containing the data

### Method Descriptions

| Method | Description |
|--------|-------------|
| `fetchData` | Fetches data based on the provided options (sorting, pagination, filters, etc.) |
| `getRowData` | Extracts the row data from the response |
| `getRowCount` | Gets the total count of rows from the response |
| `getPageCount` | Gets the total number of pages from the response |
| `getInitialData` | Gets the initial data to display before any fetching occurs |
| `prefetchAdjacentPages` | Optional method to prefetch adjacent pages for smoother pagination |

## BaseDataProvider Abstract Class

The BaseDataProvider abstract class provides a base implementation of the DataProvider interface that uses a DataCache for efficient data fetching and caching:

```tsx
export abstract class BaseDataProvider<TData, TResponse> implements DataProvider<TData, TResponse> {
    protected dataCache: DataCache<TResponse>;
    protected initialData: TResponse;

    /**
     * Creates a new BaseDataProvider
     *
     * @param dataCache The data cache instance to use
     * @param initialData The initial data to use before any fetching occurs
     */
    constructor(dataCache: DataCache<TResponse>, initialData: TResponse) {
        this.dataCache = dataCache;
        this.initialData = initialData;
    }

    /**
     * Fetches data using the data cache
     *
     * @param options Table options
     * @returns Promise resolving to the response data
     */
    fetchData(options: TableOptions): Promise<TResponse> {
        return this.dataCache.fetchData(options as FetchOptions);
    }

    /**
     * Gets the initial data
     *
     * @returns The initial response data
     */
    getInitialData(): TResponse {
        return this.initialData;
    }

    /**
     * Prefetches adjacent pages for smoother pagination
     *
     * @param options Current table options
     */
    prefetchAdjacentPages(options: TableOptions): void {
        this.dataCache.prefetchAdjacentPages(options as FetchOptions);
    }

    /**
     * Abstract method to extract row data from response
     * Must be implemented by concrete providers
     */
    abstract getRowData(response: TResponse): TData[];

    /**
     * Abstract method to get row count from response
     * Must be implemented by concrete providers
     */
    abstract getRowCount(response: TResponse): number;

    /**
     * Abstract method to get page count from response
     * Must be implemented by concrete providers
     */
    abstract getPageCount(response: TResponse): number;
}
```

### Abstract Methods

When extending BaseDataProvider, you must implement the following abstract methods:

- `getRowData`: Extract row data from the response
- `getRowCount`: Get the total count of rows from the response
- `getPageCount`: Get the total number of pages from the response

## Creating Custom DataProviders

To create a custom DataProvider, extend the BaseDataProvider class and implement the abstract methods:

```tsx
export class ProductDataProvider extends BaseDataProvider<Product, ProductResponse> {
    /**
     * Creates a new ProductDataProvider
     *
     * @param baseApiUrl Base API URL
     */
    constructor(baseApiUrl: string) {
        // Create a product-specific data cache
        const productCache = createDataCache<ProductResponse>(
            baseApiUrl,
            "products",
            "name"
        );
        super(productCache, initialProductResponse);
    }

    /**
     * Extracts row data from the product response
     *
     * @param response Product API response
     * @returns Array of product items
     */
    getRowData(response: ProductResponse): Product[] {
        return response.data;
    }

    /**
     * Gets the total count of rows from the product response
     *
     * @param response Product API response
     * @returns Total number of items
     */
    getRowCount(response: ProductResponse): number {
        return response.totalCount;
    }

    /**
     * Gets the total number of pages from the product response
     *
     * @param response Product API response
     * @returns Total number of pages
     */
    getPageCount(response: ProductResponse): number {
        return response.pageCount;
    }
}
```

### Initial Data

You need to provide initial data when creating a DataProvider. This data is used before any fetching occurs:

```tsx
const initialProductResponse: ProductResponse = {
    data: [],
    totalCount: 0,
    pageCount: 0
};

export class ProductDataProvider extends BaseDataProvider<Product, ProductResponse> {
    constructor(baseApiUrl: string) {
        const productCache = createDataCache<ProductResponse>(baseApiUrl, "products", "name");
        super(productCache, initialProductResponse);
    }
    // ...
}
```

## Integration with DataCache

The BaseDataProvider uses a DataCache instance to handle data fetching and caching:

```tsx
import { createDataCache } from './lib/dataCache';

// Create a cache for your entity type
const productCache = createDataCache<ProductResponse>(
    baseApiUrl,      // Base API URL
    'products',      // Endpoint
    'name'           // Field to use for global filtering
);

// Create a DataProvider using the cache
const productDataProvider = new ProductDataProvider(productCache, initialProductResponse);
```

### DataCache Factory Function

The `createDataCache` factory function makes it easy to create DataCache instances:

```tsx
export function createDataCache<T>(
    baseUrl: string,
    endpoint: string,
    globalFilterField?: string
): DataCache<T> {
    return new DataCache<T>(baseUrl, endpoint, globalFilterField);
}
```

## Advanced Usage

### Custom Data Fetching Logic

You can override the `fetchData` method to implement custom data fetching logic:

```tsx
export class CustomProductDataProvider extends BaseDataProvider<Product, ProductResponse> {
    // ...

    async fetchData(options: TableOptions): Promise<ProductResponse> {
        // Custom logic before fetching
        console.log("Fetching products with options:", options);

        // Call the base implementation
        const response = await super.fetchData(options);

        // Custom logic after fetching
        console.log("Fetched products:", response);

        return response;
    }
}
```

### Prefetching Adjacent Pages

The BaseDataProvider provides a `prefetchAdjacentPages` method that uses the DataCache to prefetch adjacent pages for smoother pagination:

```tsx
prefetchAdjacentPages(options: TableOptions): void {
    this.dataCache.prefetchAdjacentPages(options as FetchOptions);
}
```

You can call this method when the user navigates to a new page:

```tsx
// In your component
const handlePageChange = (newPage: number) => {
    // Update the current page
    setCurrentPage(newPage);

    // Prefetch adjacent pages
    dataProvider.prefetchAdjacentPages({
        pagination: { pageIndex: newPage, pageSize: 10 },
        sorting: currentSorting
    });
};
```

### Cache Invalidation

You can invalidate the cache when data changes:

```tsx
// After adding a new product
dataProvider.dataCache.invalidateCache({
    pagination: { pageIndex: 0, pageSize: 10 },
    sorting: [{ id: 'name', desc: false }]
});
```

### Clearing the Cache

You can clear the entire cache:

```tsx
dataProvider.dataCache.clearCache();
```

## Best Practices

### Type Safety

Always use proper types for your data and response:

```tsx
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

export class ProductDataProvider extends BaseDataProvider<Product, ProductResponse> {
    // ...
}
```

### Error Handling

Implement proper error handling in your DataProvider:

```tsx
export class ProductDataProvider extends BaseDataProvider<Product, ProductResponse> {
    // ...

    async fetchData(options: TableOptions): Promise<ProductResponse> {
        try {
            return await super.fetchData(options);
        } catch (error) {
            console.error("Error fetching products:", error);
            // Return empty response or throw a custom error
            return {
                data: [],
                totalCount: 0,
                pageCount: 0
            };
        }
    }
}
```

### Memoization

Use `useMemo` to create the DataProvider to prevent unnecessary re-creation:

```tsx
const dataProvider = useMemo(() => {
    return new ProductDataProvider(baseApiUrl);
}, []);
```

### Separation of Concerns

Create separate DataProvider classes for different entity types:

```tsx
// ProductDataProvider.ts
export class ProductDataProvider extends BaseDataProvider<Product, ProductResponse> {
    // ...
}

// UserDataProvider.ts
export class UserDataProvider extends BaseDataProvider<User, UserResponse> {
    // ...
}
```

## Examples

### Basic Example

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

### Multiple Tables with Different DataProviders

```tsx
import { DataTable } from "@/components/data-table";
import { ProductDataProvider } from "./ProductDataProvider";
import { UserDataProvider } from "./UserDataProvider";
import { productColumns } from "./productColumns";
import { userColumns } from "./userColumns";

export function Dashboard() {
    // Create data providers
    const productDataProvider = new ProductDataProvider('https://api.example.com');
    const userDataProvider = new UserDataProvider('https://api.example.com');
    
    return (
        <div>
            <h2>Products</h2>
            <DataTable<Product, ProductResponse>
                columns={productColumns}
                dataProvider={productDataProvider}
                features={{ enablePagination: true }}
            />
            
            <h2>Users</h2>
            <DataTable<User, UserResponse>
                columns={userColumns}
                dataProvider={userDataProvider}
                features={{ enablePagination: true }}
            />
        </div>
    );
}
```

### Custom DataProvider with Additional Methods

```tsx
export class EnhancedProductDataProvider extends BaseDataProvider<Product, ProductResponse> {
    // ... implement required methods
    
    // Add custom methods
    async addProduct(product: Omit<Product, 'id'>): Promise<Product> {
        const response = await fetch(`${this.baseApiUrl}/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(product)
        });
        
        const newProduct = await response.json();
        
        // Invalidate cache after adding a product
        this.dataCache.invalidateCache({
            pagination: { pageIndex: 0, pageSize: 10 }
        });
        
        return newProduct;
    }
    
    async deleteProduct(id: number): Promise<void> {
        await fetch(`${this.baseApiUrl}/products/${id}`, {
            method: 'DELETE'
        });
        
        // Invalidate cache after deleting a product
        this.dataCache.invalidateCache({
            pagination: { pageIndex: 0, pageSize: 10 }
        });
    }
}
```

Using the enhanced DataProvider:

```tsx
function ProductManager() {
    const dataProvider = useMemo(() => {
        return new EnhancedProductDataProvider('https://api.example.com');
    }, []);
    
    const handleAddProduct = async () => {
        const newProduct = {
            name: 'New Product',
            category: 'Electronics',
            price: 99.99,
            stock: 10,
            description: 'A new product'
        };
        
        await dataProvider.addProduct(newProduct);
        // The table will automatically update due to cache invalidation
    };
    
    const handleDeleteProduct = async (id: number) => {
        await dataProvider.deleteProduct(id);
        // The table will automatically update due to cache invalidation
    };
    
    return (
        <div>
            <button onClick={handleAddProduct}>Add Product</button>
            
            <DataTable<Product, ProductResponse>
                columns={productColumns}
                dataProvider={dataProvider}
                features={{ enablePagination: true }}
            />
        </div>
    );
}
```

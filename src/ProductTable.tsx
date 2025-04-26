import {ColumnDef, SortingState} from "@tanstack/react-table";
import { DataTable } from "./DataTable";
import { debounce } from "./lib/utils";
import { createDataCache, FetchOptions } from "./lib/dataCache";
import React, {ChangeEvent, useEffect} from "react";

// Product type definition
export type Product = {
    id: number;
    name: string;
    category: string;
    price: number;
    stock: number;
    description: string;
};

// Response type for Product data
export type ProductResponse = {
    first: number;
    prev: number;
    next: number;
    last: number;
    pages: number;
    items: number;
    data: Product[];
}

// Use FetchOptions from dataCache
export type Options = FetchOptions;

const baseApiUrl = import.meta.env.VITE_API_URL;

// Create a product-specific data cache
const productCache = createDataCache<ProductResponse>(baseApiUrl, 'products', 'name');

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

// Initial empty response
export const initialProductResponse: ProductResponse = {
    data: [],
    pages: 0,
    items: 0,
    first: 0,
    prev: 0,
    next: 0,
    last: 0
};

// Define columns for Product data
export const productColumns: ColumnDef<Product, { filterComponent: any }>[] = [
    {
        accessorKey: 'name',
        header: 'Product Name',
        enableSorting: true,
        cell: info => info.getValue(),
        meta: {
            filterComponent: (column: any) => (
                <input
                    type="search"
                    onChange={debounce((e: ChangeEvent<HTMLInputElement>) => column.setFilterValue(e.target.value), 500)}
                />
            )
        }
    },
    {
        accessorKey: 'category',
        header: 'Category',
        enableSorting: true,
        cell: info => info.getValue(),
        meta: {
            filterComponent: (column: any) => (
                <input
                    type="search"
                    onChange={debounce((e: ChangeEvent<HTMLInputElement>) => column.setFilterValue(e.target.value), 500)}
                />
            )
        }
    },
    {
        accessorKey: 'price',
        header: 'Price',
        enableSorting: true,
        cell: info => `$${info.getValue()}`,
        meta: {
            filterComponent: (column: any) => (
                <input
                    type="number"
                    onChange={debounce((e: ChangeEvent<HTMLInputElement>) => column.setFilterValue(e.target.value), 500)}
                />
            )
        }
    },
    {
        accessorKey: 'stock',
        header: 'Stock',
        enableSorting: true,
        cell: info => info.getValue(),
        meta: {
            filterComponent: (column: any) => (
                <input
                    type="number"
                    onChange={debounce((e: ChangeEvent<HTMLInputElement>) => column.setFilterValue(e.target.value), 500)}
                />
            )
        }
    },
    {
        accessorKey: 'description',
        header: 'Description',
        cell: info => info.getValue(),
        enableSorting: false,
        meta: {
            // filterComponent: (column: any) => (
            //     <input
            //         type="search"
            //         onChange={debounce((e: ChangeEvent<HTMLInputElement>) => column.setFilterValue(e.target.value), 500)}
            //     />
            // )
        }
    }
];

// ProductTable component that uses the generic DataTable
export const ProductTable = ({
    options,
    features,
    children
}: {
    options?: Options,
    features?: {
        enableSorting?: boolean,
        enablePagination?: boolean,
        enableGlobalFilter?: boolean,
        enableColumnFilters?: boolean,
        initialPageSize?: number,
        initialSorting?: SortingState
    },
    children?: React.ReactNode
}) => {
    // Effect to prefetch adjacent pages when the current page changes
    useEffect(() => {
        if (options?.pagination) {
            // Use a small timeout to not interfere with the current fetch
            const timeoutId = setTimeout(() => {
                prefetchAdjacentPages(options);
            }, 100);

            return () => clearTimeout(timeoutId);
        }
    }, [options?.pagination?.pageIndex]);

    return (
        <DataTable<Product, ProductResponse>
            columns={productColumns}
            options={options}
            initialData={initialProductResponse}
            getRowData={(response) => response.data}
            getRowCount={(response) => response.items}
            getPageCount={(response) => response.pages}
            fetchDataFn={fetchProducts}
            features={features}
        >
            {children}
        </DataTable>
    );
};

export default ProductTable;

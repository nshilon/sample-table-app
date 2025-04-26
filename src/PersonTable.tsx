import {ColumnDef, ColumnFiltersState, OnChangeFn, PaginationState, SortingState} from "@tanstack/react-table";
import { DataTable } from "./DataTable";
import { debounce } from "./lib/utils";
import {ChangeEvent, useEffect} from "react";

// Person type definition
export type Person = {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    gender: string;
    ip_address: string;
};

// Response type for Person data
export type PersonResponse = {
    first: number;
    prev: number;
    next: number;
    last: number;
    pages: number;
    items: number;
    data: Person[];
}

// Options type for fetching data
export type Options = {
    sorting?: SortingState;
    pagination?: PaginationState;
    columnFilters?: ColumnFiltersState;
    globalFilter?: string;
}

// Simple cache to store fetched data
const dataCache = new Map<string, Promise<PersonResponse>>();

// Helper to generate a cache key from options
export const getCacheKey = (options: Options): string => {
    const sortKey = options.sorting && options.sorting.length > 0 ? options.sorting.map(s => `${s.id}:${s.desc}`).join(',') : '';
    const pageKey = options.pagination ? `page=${options.pagination.pageIndex},size=${options.pagination.pageSize}` : 'page=0,size=10';
    const filterKey = options.globalFilter || '';
    const columnFilterKey = options.columnFilters && options.columnFilters.length > 0 ? options.columnFilters.map(f => `${f.id}:${f.value}`).join(',') : '';

    return `${sortKey}|${pageKey}|${filterKey}|${columnFilterKey}`;
};

const baseApiUrl = import.meta.env.VITE_API_URL

// Function to fetch users
export const fetchUsers = async (options: Options): Promise<PersonResponse> => {
    // Generate cache key
    const cacheKey = getCacheKey(options);

    // Check if we have cached data
    if (dataCache.has(cacheKey)) {
        return dataCache.get(cacheKey)!;
    }


    let url = `${baseApiUrl}/users?`;

    if (options.sorting && options.sorting.length > 0) {
        if (!url.endsWith('?')) {
            url += '&';
        }
        url += "_sort=" + options.sorting.map(sort => `${sort.desc ? '-' : ''}${sort.id}`).join(',');
    }

    if (options.pagination) {
        if (!url.endsWith('?')) {
            url += '&';
        }
        url += `_page=${options.pagination.pageIndex + 1}&_per_page=${options.pagination.pageSize}`;
    } else {
        // Default pagination if not provided
        if (!url.endsWith('?')) {
            url += '&';
        }
        url += `_page=1&_per_page=10`;
    }

    if (options.globalFilter) {
        if (!url.endsWith('?')) {
            url += '&';
        }
        url += `first_name=${options.globalFilter}`;
    }

    if (options.columnFilters && options.columnFilters.length > 0) {
        if (!url.endsWith('?')) {
            url += '&';
        }

        url += options.columnFilters.map(filter => `&${filter.id}=${filter.value}`).join('');
    }

    // Create the promise for fetching data
    const fetchPromise = fetch(url).then(response => response.json());

    // Store in cache
    dataCache.set(cacheKey, fetchPromise);

    return fetchPromise;
};

// Function to prefetch adjacent pages
export const prefetchAdjacentPages = (currentOptions: Options) => {
    if (!currentOptions.pagination) return;

    const { pageIndex, pageSize } = currentOptions.pagination;

    // Prefetch next page if not the last page
    if (pageIndex < 1000) { // Assuming a max of 1000 pages
        const nextPageOptions = {
            ...currentOptions,
            pagination: { pageIndex: pageIndex + 1, pageSize }
        };
        fetchUsers(nextPageOptions);
    }

    // Prefetch previous page if not the first page
    if (pageIndex > 0) {
        const prevPageOptions = {
            ...currentOptions,
            pagination: { pageIndex: pageIndex - 1, pageSize }
        };
        fetchUsers(prevPageOptions);
    }
};

// Function to prefetch initial data
export const prefetchInitialData = () => {
    // Prefetch first page with default settings
    fetchUsers({
        pagination: { pageIndex: 0, pageSize: 10 }
    });
};

// Define columns for Person data
export const personColumns: ColumnDef<Person, { filterComponent: any }>[] = [
    {
        accessorKey: 'first_name',
        header: 'First Name',
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
        accessorKey: 'last_name',
        header: 'Last Name',
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
        accessorKey: 'email',
        header: 'Email',
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
        accessorKey: 'gender',
        header: 'Gender',
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
        accessorKey: 'ip_address',
        header: 'IP Address',
        cell: info => info.getValue(),
        meta: {
            filterComponent: (column: any) => (
                <input
                    type="search"
                    onChange={debounce((e: ChangeEvent<HTMLInputElement>) => column.setFilterValue(e.target.value), 500)}
                />
            )
        }
    }
];

// Initial empty response
export const initialPersonResponse: PersonResponse = {
    data: [],
    pages: 0,
    items: 0,
    first: 0,
    prev: 0,
    next: 0,
    last: 0
};

// PersonTable component that uses the generic DataTable
export const PersonTable = ({
    getData,
    options,
    onPaginationChange,
    onSortingChange,
    onGlobalFilterChange,
    onColumnFiltersChange,
    features,
    children
}: {
    getData: Promise<PersonResponse>,
    options?: Options,
    onSortingChange?: OnChangeFn<SortingState>,
    onPaginationChange?: OnChangeFn<PaginationState>,
    onColumnFiltersChange?: OnChangeFn<ColumnFiltersState>,
    onGlobalFilterChange?: OnChangeFn<string>,
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
        <DataTable<Person, PersonResponse>
            getData={getData}
            columns={personColumns}
            options={options}
            initialData={initialPersonResponse}
            onPaginationChange={onPaginationChange}
            onSortingChange={onSortingChange}
            onGlobalFilterChange={onGlobalFilterChange}
            onColumnFiltersChange={onColumnFiltersChange}
            getRowData={(response) => response.data}
            getRowCount={(response) => response.items}
            getPageCount={(response) => response.pages}
            fetchDataFn={fetchUsers}
            features={features}
        >
            {children}
        </DataTable>
    );
};

export default PersonTable;

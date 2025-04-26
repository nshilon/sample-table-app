import {ColumnDef, ColumnFiltersState, OnChangeFn, PaginationState, SortingState} from "@tanstack/react-table";
import { DataTable } from "./DataTable";
import { debounce } from "./lib/utils";
import { createDataCache, FetchOptions } from "./lib/dataCache";
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

// Use FetchOptions from dataCache
export type Options = FetchOptions;

const baseApiUrl = import.meta.env.VITE_API_URL;

// Create a person-specific data cache
const personCache = createDataCache<PersonResponse>(baseApiUrl, 'users', 'first_name');

// Function to fetch users using the generic cache
export const fetchUsers = async (options: Options): Promise<PersonResponse> => {
    return personCache.fetchData(options);
};

// Function to prefetch adjacent pages
export const prefetchAdjacentPages = (currentOptions: Options) => {
    personCache.prefetchAdjacentPages(currentOptions);
};

// Function to prefetch initial data
export const prefetchInitialData = () => {
    return personCache.prefetchInitialData({
        sorting: [{ id: 'first_name', desc: false }]
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
        <DataTable<Person, PersonResponse>
            columns={personColumns}
            options={options}
            initialData={initialPersonResponse}
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

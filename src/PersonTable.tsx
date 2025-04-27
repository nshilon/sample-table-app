import {ColumnDef, SortingState} from "@tanstack/react-table";
import { DataTable } from "./DataTable";
import { debounce } from "./lib/utils";
import { FetchOptions } from "./lib/dataCache";
import React, {ChangeEvent, useEffect, useMemo} from "react";
import { PersonDataProvider } from "./providers/PersonDataProvider";

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

// Function to prefetch initial data
export const prefetchInitialData = () => {
    const provider = new PersonDataProvider(baseApiUrl);
    return provider.prefetchInitialData();
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
    // Create the data provider
    const dataProvider = useMemo(() => {
        return new PersonDataProvider(baseApiUrl);
    }, []);

    // Effect to prefetch adjacent pages when the current page changes
    useEffect(() => {
        if (options?.pagination) {
            // Use a small timeout to not interfere with the current fetch
            const timeoutId = setTimeout(() => {
                dataProvider.prefetchAdjacentPages(options);
            }, 100);

            return () => clearTimeout(timeoutId);
        }
    }, [options?.pagination?.pageIndex, dataProvider]);

    return (
        <DataTable<Person, PersonResponse>
            columns={personColumns}
            options={options}
            dataProvider={dataProvider}
            features={features}
        >
            {children}
        </DataTable>
    );
};

export default PersonTable;

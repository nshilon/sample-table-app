// const data = {
//     "id": 1000,
//     "first_name": "Gerhardine",
//     "last_name": "Mauchlen",
//     "email": "gmauchlenrr@bbb.org",
//     "gender": "Female",
//     "ip_address": "156.16.179.67"
// }

import {ChangeEvent, useDeferredValue, useTransition, useState, useEffect, useRef} from "react";
import {
    ColumnFiltersState,
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    OnChangeFn,
    PaginationState,
    SortingState,
    useReactTable
} from "@tanstack/react-table";
import {debounce} from "./lib/utils.tsx";

type Person = {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    gender: string;
    ip_address: string;
};

export type Options = {
    sorting?: SortingState;
    pagination?: PaginationState;
    columnFilters?: ColumnFiltersState;
    globalFilter?: string;

}

// Simple cache to store fetched data
const dataCache = new Map<string, Promise<PersonResponse>>();

// Helper to generate a cache key from options
const getCacheKey = (options: Options): string => {
    const sortKey = options.sorting ? options.sorting.map(s => `${s.id}:${s.desc}`).join(',') : '';
    const pageKey = options.pagination ? `page=${options.pagination.pageIndex},size=${options.pagination.pageSize}` : '';
    const filterKey = options.globalFilter || '';
    const columnFilterKey = options.columnFilters ? options.columnFilters.map(f => `${f.id}:${f.value}`).join(',') : '';

    return `${sortKey}|${pageKey}|${filterKey}|${columnFilterKey}`;
};

export const fetchUsers = async (options: Options) => {
    // Generate cache key
    const cacheKey = getCacheKey(options);

    // Check if we have cached data
    if (dataCache.has(cacheKey)) {
        return dataCache.get(cacheKey);
    }

    let url = 'http://localhost:3001/users?';

    if (options.sorting) {
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
    }

    if (options.globalFilter) {
        if (!url.endsWith('?')) {
            url += '&';
        }
        url += `first_name=${options.globalFilter}`;
    }

    if (options.columnFilters) {
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
}

const columnHelper = createColumnHelper<Person>();

const columns = [
    columnHelper.accessor('first_name', {header: 'First Name', enableSorting: true}),
    columnHelper.accessor('last_name', {header: 'Last Name', enableSorting: true}),
    columnHelper.accessor('email', {header: 'Email'}),
    columnHelper.accessor('gender', {header: 'Gender'}),
    columnHelper.accessor('ip_address', {header: 'IP Address'}),
];


type PersonResponse = {
    first: number;
    prev: number;
    next: number;
    last: number;
    pages: number;
    items: number;
    data: Person[];
}

const initialResponse: PersonResponse = {
        data: [],
        pages: 0,
        items: 0,
        first: 0,
        prev: 0,
        next: 0,
        last: 0
    }

const DataTable = ({
                       getData,
                       options,
                       onPaginationChange,
                       onSortingChange,
                       onGlobalFilterChange,
                       onColumnFiltersChange,
                       children
                   }: {
    getData: Promise<PersonResponse>,
    options: Options,
    onSortingChange?: OnChangeFn<SortingState>,
    onPaginationChange?: OnChangeFn<PaginationState>,
    onColumnFiltersChange?: OnChangeFn<ColumnFiltersState>,
    onGlobalFilterChange?: OnChangeFn<string>,
    children?: React.ReactNode
}) => {
    // Use transition to avoid showing the Suspense fallback during transitions
    const [isPending, startTransition] = useTransition();

    // Keep track of the latest data
    const [currentData, setCurrentData] = useState<PersonResponse>(initialResponse);

    // Keep a reference to the latest options to use in effects
    const latestOptionsRef = useRef(options);
    latestOptionsRef.current = options;

    // Extract options for table state
    const {pagination, sorting, globalFilter, columnFilters} = options;

    // Effect to prefetch adjacent pages when the current page changes
    useEffect(() => {
        if (options.pagination) {
            // Use a small timeout to not interfere with the current fetch
            const timeoutId = setTimeout(() => {
                prefetchAdjacentPages(options);
            }, 100);

            return () => clearTimeout(timeoutId);
        }
    }, [options.pagination?.pageIndex]);

    // Use effect to fetch data and update state
    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            try {
                // Start transition to mark this update as non-urgent
                startTransition(async () => {
                    const result = await getData;
                    if (isMounted) {
                        setCurrentData(result);
                    }
                });
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();

        return () => {
            isMounted = false;
        };
    }, [getData]);

    // Apply deferred value to the current data to avoid flickering
    const deferredData = useDeferredValue(currentData);

    // Extract data from the response
    const {data, items, pages} = deferredData;

    const table = useReactTable<Person>({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        manualSorting: true,
        manualFiltering: true,
        enableGlobalFilter: true,
        rowCount: items,
        state: {
            pagination,
            sorting,
            globalFilter,
            columnFilters,
        },
        onPaginationChange,
        onSortingChange,
        onGlobalFilterChange,
        onColumnFiltersChange,
    });


    return (
        <div style={{ opacity: isPending ? 0.7 : 1, transition: 'opacity 0.2s' }}>
            <table>
            <thead>
            {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                        <th key={header.id}>
                            {header.isPlaceholder ? null : (
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '.2rem', ...(header.column.getCanSort() ? {cursor: 'pointer'} : {})
                                }}>


                                    <button onClick={header.column.getToggleSortingHandler()} style={{
                                        height: '1rem',
                                        lineHeight: '1rem',
                                        padding: '0 .25rem',
                                        outline: 'none',
                                        border: 'none',
                                        background: 'none',
                                        cursor: 'pointer'
                                    }}>
                                        {flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                        )}

                                        {header.column.getCanSort() ? (
                                            header.column.getIsSorted() ? (header.column.getIsSorted() === 'desc' ? '🔻' : '🔺') : ''


                                        ) : null}
                                    </button>
                                    <span>

                                                </span>


                                    <input type="search"
                                           onChange={debounce((e: ChangeEvent<HTMLInputElement>) => header.column.setFilterValue(e.target.value), 500)}/>
                                </div>
                            )}
                        </th>
                    ))}
                </tr>
            ))}
            </thead>
            <tbody>
            {table.getRowModel().rows.map(row => (
                <tr key={row.id}>
                    {row.getVisibleCells().map(cell => (
                        <td key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                    ))}
                </tr>
            ))}
            </tbody>
            <tfoot>

            <tr>
                <td colSpan={columns.length}>
                    <button onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>
                        {'<<'}
                    </button>
                    <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                        {'<'}
                    </button>

                    <span>
                page {table.getState().pagination.pageIndex + 1} of {pages} pages, total items {items}
                </span>


                    <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                        {'>'}
                    </button>
                    <button onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                            disabled={!table.getCanNextPage()}>
                        {'>>'}
                    </button>
                </td>


            </tr>


            </tfoot>
        </table>
        {children}
        </div>
    );
}

export default DataTable;
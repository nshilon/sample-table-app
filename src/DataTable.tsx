import {
    ColumnDef,
    ColumnFiltersState,
    flexRender,
    getCoreRowModel, OnChangeFn,
    PaginationState,
    SortingState,
    useReactTable
} from "@tanstack/react-table";
import {useDeferredValue, useEffect, useRef, useState, useTransition} from "react";
import {deepMerge} from "./lib/utils.tsx";
import { DataProvider } from "./lib/dataProvider";

// Generic type for table options
export type TableOptions = {
    sorting?: SortingState;
    pagination?: PaginationState;
    columnFilters?: ColumnFiltersState;
    globalFilter?: string;
};

// Feature flags for DataTable
export type DataTableFeatures = {
    enableSorting?: boolean;
    enablePagination?: boolean;
    enableGlobalFilter?: boolean;
    enableColumnFilters?: boolean;
    initialPageSize?: number;
    initialSorting?: SortingState;
};

// Generic DataTable component
export function DataTable<TData, TResponse>({
                                                columns,
                                                options,
                                                dataProvider,
                                                features = {
                                                    enableSorting: true,
                                                    enablePagination: true,
                                                    enableGlobalFilter: true,
                                                    enableColumnFilters: true,
                                                    initialPageSize: 10,
                                                    initialSorting: []
                                                }
                                            }: {
    columns: ColumnDef<TData, { filterComponent: any }>[];
    options?: TableOptions;
    dataProvider: DataProvider<TData, TResponse>;
    features?: DataTableFeatures;
}) {
    // Use transition to avoid showing the Suspense fallback during transitions
    const [isPending, startTransition] = useTransition();

    // Keep track of the latest data
    const [currentData, setCurrentData] = useState<TResponse>(dataProvider.getInitialData());

    // Internal state management for table features
    const [pagination, setPagination] = useState<PaginationState>(options?.pagination || {
        pageIndex: 0,
        pageSize: features.initialPageSize || 10
    });
    const [sorting, setSorting] = useState<SortingState>(options?.sorting || features.initialSorting || []);
    const [globalFilter, setGlobalFilter] = useState<string>(options?.globalFilter || '');
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(options?.columnFilters || []);

    // Create a TableOptions object from internal state
    const internalOptions = {
        pagination,
        sorting,
        globalFilter,
        columnFilters
    };

    // Use provided options or internal state
    const tableOptions = options || internalOptions;

    // Keep a reference to the latest options to use in effects
    const latestOptionsRef = useRef(tableOptions);
    latestOptionsRef.current = tableOptions;

    // Function to get current data based on internal state
    const getCurrentData = () => {
        return dataProvider.fetchData(options || internalOptions);
    };

    // Handle internal state changes
    const handlePaginationChange: OnChangeFn<PaginationState> = (updater) => {
        const newPagination = typeof updater === 'function' ? updater(pagination) : updater;
        setPagination(newPagination);
    };

    const handleSortingChange: OnChangeFn<SortingState> = (updater) => {
        const newSorting = typeof updater === 'function' ? updater(sorting) : updater;
        setSorting(newSorting);
    };

    const handleGlobalFilterChange: OnChangeFn<string> = (updater) => {
        const newGlobalFilter = typeof updater === 'function' ? updater(globalFilter) : updater;
        setGlobalFilter(newGlobalFilter);
    };

    const handleColumnFiltersChange: OnChangeFn<ColumnFiltersState> = (updater) => {
        const newColumnFilters = typeof updater === 'function' ? updater(columnFilters) : updater;
        setColumnFilters(newColumnFilters);
    };

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
                console.error('Error fetching data:', error);
            }
        };

        fetchData();

        return () => {
            isMounted = false;
        };
    }, [options, pagination, sorting, globalFilter, columnFilters, dataProvider]);

    // Apply deferred value to the current data to avoid flickering
    const deferredData = useDeferredValue(currentData);

    // Extract data from the response using the dataProvider
    const data = dataProvider.getRowData(deferredData);
    const rowCount = dataProvider.getRowCount(deferredData);
    const pageCount = dataProvider.getPageCount(deferredData);

    // Create the table instance using useReactTable
    const baseTableOptions = {
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        rowCount: rowCount,
        pageCount: pageCount,
    };

    // prepare options based on features
    if (features.enablePagination) {
        deepMerge(baseTableOptions, {
            manualPagination: true,
            state: {
                pagination: options?.pagination || pagination,
            },
            onPaginationChange: handlePaginationChange,

        });
    }

    if (features.enableSorting) {
        deepMerge(baseTableOptions, {
            enableSorting: true,
            manualSorting: true,
            maxMultiSortColCount: 3,
            state: {
                sorting: options?.sorting || sorting,
            },
            onSortingChange: handleSortingChange,

        });
    }

    if (features.enableGlobalFilter) {
        deepMerge(baseTableOptions, {
            enableGlobalFilter: true,
            manualGlobalFilter: true,
            state: {
                globalFilter: options?.globalFilter || globalFilter,
            },
            onGlobalFilterChange: handleGlobalFilterChange,
        });
    }

    if (features.enableColumnFilters) {
        deepMerge(baseTableOptions, {
            manualFiltering: true,
            state: {
                columnFilters: options?.columnFilters || columnFilters,
            },
            onColumnFiltersChange: handleColumnFiltersChange,
        });
    }


    const table = useReactTable<TData>(baseTableOptions);

    return (
        <div style={{opacity: isPending ? 0.7 : 1, transition: 'opacity 0.2s'}}>
            {features.enableGlobalFilter && (
                <div style={{marginBottom: '1rem'}}>
                    <input
                        placeholder="Search..."
                        type="search"
                        value={options?.globalFilter || globalFilter}
                        onChange={e => {
                            const value = e.target.value;
                            handleGlobalFilterChange(value);
                        }}
                        style={{
                            padding: '0.5rem',
                            borderRadius: '4px',
                            border: '1px solid #ccc',
                            width: '100%',
                            maxWidth: '300px'
                        }}
                    />
                </div>
            )}
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
                                        gap: '.2rem',
                                        ...(header.column.getCanSort() ? {cursor: 'pointer'} : {})
                                    }}>
                                        <button
                                            onClick={header.column.getToggleSortingHandler()}
                                            style={{
                                                height: '1rem',
                                                lineHeight: '1rem',
                                                padding: '0 .25rem',
                                                outline: 'none',
                                                border: 'none',
                                                background: 'none',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            {flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                            {header.column.getCanSort() ? (
                                                header.column.getIsSorted() ?
                                                    (header.column.getIsSorted() === 'desc' ? '🔻' : '🔺') : ''
                                            ) : null}
                                            {header.column.getCanSort() && header.column.getIsSorted() && table.getState().sorting.length > 1 ?
                                                <sup
                                                    style={{fontSize: '.5rem'}}>{header.column.getSortIndex() + 1}</sup> : null}
                                        </button>



                                        {/* Render custom filter component if provided */}
                                        {

                                            table.options.manualFiltering &&
                                            header.column.getCanFilter() &&

                                            header.column.columnDef.meta?.filterComponent &&
                                            header.column.columnDef.meta.filterComponent(header.column)
                                        }
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
                {features.enablePagination && (
                    <tfoot>
                    <tr>
                        <td colSpan={columns.length}>
                            <button onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>
                                {'<<'}
                            </button>
                            <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                                {'<'}
                            </button>
                            <small>
                                    page {table.getState().pagination.pageIndex + 1} of {pageCount} pages, total items {rowCount}
                                </small>
                            <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                                {'>'}
                            </button>
                            <button
                                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                                disabled={!table.getCanNextPage()}
                            >
                                {'>>'}
                            </button>
                        </td>
                    </tr>
                    </tfoot>
                )}
            </table>
        </div>
    );
}

export default DataTable;
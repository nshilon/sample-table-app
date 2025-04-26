import {
    ColumnDef,
    ColumnFiltersState,
    flexRender,
    getCoreRowModel, OnChangeFn,
    PaginationState,
    SortingState,
    useReactTable
} from "@tanstack/react-table";
import {ReactNode, useDeferredValue, useEffect, useRef, useState, useTransition} from "react";

// Generic type for table options
export type TableOptions = {
    sorting?: SortingState;
    pagination?: PaginationState;
    columnFilters?: ColumnFiltersState;
    globalFilter?: string;
};

// Generic DataTable component
export function DataTable<TData, TResponse>({
    getData,
    columns,
    options,
    initialData,
    onPaginationChange,
    onSortingChange,
    onGlobalFilterChange,
    onColumnFiltersChange,
    getRowData,
    getRowCount,
    getPageCount,
    children
}: {
    getData: Promise<TResponse>;
    columns: ColumnDef<TData>[];
    options: TableOptions;
    initialData: TResponse;
    onPaginationChange?: OnChangeFn<PaginationState>;
    onSortingChange?: OnChangeFn<SortingState>;
    onGlobalFilterChange?: OnChangeFn<string>;
    onColumnFiltersChange?: OnChangeFn<ColumnFiltersState>;
    getRowData: (response: TResponse) => TData[];
    getRowCount: (response: TResponse) => number;
    getPageCount: (response: TResponse) => number;
    children?: React.ReactNode;
}) {
    // Use transition to avoid showing the Suspense fallback during transitions
    const [isPending, startTransition] = useTransition();

    // Keep track of the latest data
    const [currentData, setCurrentData] = useState<TResponse>(initialData);

    // Keep a reference to the latest options to use in effects
    const latestOptionsRef = useRef(options);
    latestOptionsRef.current = options;

    // Extract options for table state
    const { pagination, sorting, globalFilter, columnFilters } = options;

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

    // Extract data from the response using the provided accessor functions
    const data = getRowData(deferredData);
    const rowCount = getRowCount(deferredData);
    const pageCount = getPageCount(deferredData);

    const table = useReactTable<TData>({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        manualSorting: true,
        manualFiltering: true,
        enableGlobalFilter: true,
        rowCount: rowCount,
        pageCount: pageCount,
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
                                            </button>
                                            <span></span>
                                            {/* Render custom filter component if provided */}
                                            {header.column.columnDef.meta?.filterComponent &&
                                                header.column.columnDef.meta.filterComponent(header.column)}
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
                                page {table.getState().pagination.pageIndex + 1} of {pageCount} pages, total items {rowCount}
                            </span>
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
            </table>
            {children}
        </div>
    );
}

export default DataTable;
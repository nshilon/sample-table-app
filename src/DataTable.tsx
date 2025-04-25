// const data = {
//     "id": 1000,
//     "first_name": "Gerhardine",
//     "last_name": "Mauchlen",
//     "email": "gmauchlenrr@bbb.org",
//     "gender": "Female",
//     "ip_address": "156.16.179.67"
// }

import {ChangeEvent, use} from "react";
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

export const fetchUsers = async (options: Options) => {

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

    const response = await fetch(url);
    return await response.json();
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


const DataTable = ({
                       getData,
                       options: {pagination, sorting, globalFilter, columnFilters},
                       onPaginationChange,
                       onSortingChange,
                       onGlobalFilterChange,
                       onColumnFiltersChange
                   }: {
    getData: Promise<PersonResponse>,
    options: Options,
    onSortingChange?: OnChangeFn<SortingState>,
    onPaginationChange?: OnChangeFn<PaginationState>,
    onColumnFiltersChange?: OnChangeFn<ColumnFiltersState>,
    onGlobalFilterChange?: OnChangeFn<string>

}) => {

    const {data, items, pages} = use<PersonResponse>(getData);


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


    return <>

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
    </>
}

export default DataTable;
import Button from "@/components/button.tsx";
import {Table} from "@tanstack/react-table";

export function DataTablePagination<TData>({
                                               table,
                                           }: {
    table: Table<TData>;
}) {

    return (<>
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
    )
}
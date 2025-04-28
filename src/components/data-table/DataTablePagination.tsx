import Button from "@/components/button.tsx";
import {useDataTable} from "@/components/data-table/DataTable.tsx";

export function DataTablePagination<TData>() {

    const {table} = useDataTable<TData>();

    return (<div className="hbox">
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
                page {table.getState().pagination.pageIndex + 1} of {table.options.pageCount}
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
        </div>
    )
}
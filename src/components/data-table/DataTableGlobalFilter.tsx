import {useDataTable} from "@/components/data-table/DataTable.tsx";

export function DataTableGlobalFilter() {
    const {table} = useDataTable();

    return (
        <div style={{marginBottom: "1rem"}}>
            <input
                placeholder="Search..."
                type="search"
                value={table.getState().globalFilter}
                onChange={(e) => {
                    const value = e.target.value;
                    table.options.onGlobalFilterChange?.(value);
                }}
                style={{
                    padding: "0.5rem",
                    borderRadius: "4px",
                    border: "1px solid #ccc",
                    width: "100%",
                    maxWidth: "300px",
                }}
            />
        </div>
    )
}
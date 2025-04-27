import {useState} from "react";
import type {TableOptions} from "@/components/data-table";
import {UserTable} from "./users";
import {ProductTable} from "./products";
import Button from "@/components/button.tsx";
import {useDataTable} from "@/components/data-table/DataTable.tsx";

function AppWithMultipleTables() {
    // Define initial sorting states
    const initialUsersSorting: TableOptions['sorting'] = [
        {
            id: "first_name",
            desc: false,
        },
    ];

    const initialProductSorting: TableOptions['sorting'] = [
        {
            id: "price",
            desc: true,
        },
        {
            id: "stock",
            desc: true,
        },
    ];

    // State to track which table is active
    const [activeTable, setActiveTable] = useState<"users" | "products">(
        "users",
    );


    const TotalItems = ()=> {
        const {table} = useDataTable();

        return <b>total items {table.options.rowCount}</b>;
    }


    return (
        <div>
            <div style={{marginBottom: "20px"}}>
                <Button
                    onClick={() => setActiveTable("users")}
                    style={{
                        padding: "8px 16px",
                        marginRight: "10px",
                        backgroundColor: activeTable === "users" ? "#4a90e2" : "#f0f0f0",
                        color: activeTable === "users" ? "white" : "black",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                    }}
                >
                    Show Users
                </Button>
                <Button
                    onClick={() => setActiveTable("products")}
                    style={{
                        padding: "8px 16px",
                        backgroundColor: activeTable === "products" ? "#4a90e2" : "#f0f0f0",
                        color: activeTable === "products" ? "white" : "black",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                    }}
                >
                    Show Products
                </Button>
            </div>

            {activeTable === "users" ? (
                <div>
                    <UserTable
                        options={{sorting: initialUsersSorting}}
                        features={{
                            enableSorting: true,
                            enablePagination: true,
                            enableGlobalFilter: true,
                            // enableColumnFilters: true,
                        }}
                    >
                        <em style={{color: "green"}}>this is a customized table</em>
                        <TotalItems />
                    </UserTable>
                </div>
            ) : (
                <div>
                    <ProductTable
                        options={{
                            sorting: initialProductSorting,
                            pagination: {
                                pageIndex: 0,
                                pageSize: 15,
                            },
                        }}
                        features={{
                            enableSorting: true,
                            enablePagination: true,
                            // enableGlobalFilter: true,
                            enableColumnFilters: true,
                        }}
                    />
                </div>
            )}
        </div>
    );
}

export default AppWithMultipleTables;

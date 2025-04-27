import "./App.css";

import {useState} from "react";
import type {TableOptions} from "@/components/data-table";
import {PersonTable} from "./users";
import {ProductTable} from "./products";

function AppWithMultipleTables() {
    // Define initial sorting states
    const initialPersonSorting: TableOptions['sorting'] = [
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
    const [activeTable, setActiveTable] = useState<"persons" | "products">(
        "persons",
    );

    // Prefetch initial data when component mounts
    // useEffect(() => {
    // 	prefetchPersonData();
    // 	prefetchProductData();
    // }, []);

    return (
        <div>
            <div style={{marginBottom: "20px"}}>
                <button
                    onClick={() => setActiveTable("persons")}
                    style={{
                        padding: "8px 16px",
                        marginRight: "10px",
                        backgroundColor: activeTable === "persons" ? "#4a90e2" : "#f0f0f0",
                        color: activeTable === "persons" ? "white" : "black",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                    }}
                >
                    Show Users
                </button>
                <button
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
                </button>
            </div>

            {activeTable === "persons" ? (
                <div>
                    <PersonTable
                        options={{sorting: initialPersonSorting}}
                        features={{
                            enableSorting: true,
                            enablePagination: true,
                            enableGlobalFilter: true,
                            // enableColumnFilters: true,
                        }}
                    />
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

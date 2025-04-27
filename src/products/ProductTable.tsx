import {
    DataTable,
    type TableColumnDef, type TableOptions
} from "@/components/data-table";
import {debounce} from "@/lib/utils";

import type React from "react";
import {type ChangeEvent, useMemo} from "react";
import {ProductDataProvider} from "./ProductDataProvider";
import type {Product, ProductResponse} from "./types.ts";
import {createColumnHelper} from "@tanstack/react-table";


const columnBuilder = createColumnHelper<Product>()

// Define columns for Product data
export const productColumns: TableColumnDef<
    Product
>[] = [
    {
        accessorKey: "name",
        header: "Product Name",
        enableSorting: true,
        cell: (info) => info.getValue(),
        meta: {
            filterComponent: (column: any) => (
                <input
                    type="search"
                    onChange={debounce(
                        (e: ChangeEvent<HTMLInputElement>) =>
                            column.setFilterValue(e.target.value),
                        500,
                    )}
                />
            ),
        },
    },
    {
        accessorKey: "category",
        header: "Category",
        enableSorting: true,
        cell: (info) => info.getValue(),
        meta: {
            filterComponent: (column: any) => (
                <input
                    type="search"
                    onChange={debounce(
                        (e: ChangeEvent<HTMLInputElement>) =>
                            column.setFilterValue(e.target.value),
                        500,
                    )}
                />
            ),
        },
    },
    columnBuilder.accessor("price", {
        header: "Price",
        enableSorting: true,
        cell: (info) =>
            <div style={{
                fontFamily: "monospace",
                color: info.getValue() < 400 ? "grey" : "green",
                textAlign: "right"
            }}>${info.getValue()}</div>,


        meta: {
            filterComponent: (column: any) => (
                <input
                    type="number"
                    onChange={debounce(
                        (e: ChangeEvent<HTMLInputElement>) =>
                            column.setFilterValue(e.target.value),
                        500,
                    )}
                />
            ),
        }
    }) as TableColumnDef<Product>,
    columnBuilder.accessor("stock", {
        header: "Stock",
        enableSorting: true,
        cell: (info) => <div
            style={{color: info.getValue() < 10 ? "red" : "green", textAlign: "right"}}>{info.getValue()}</div>,
        meta: {
            filterComponent: (column: any) => (
                <input
                    type="number"
                    onChange={debounce(
                        (e: ChangeEvent<HTMLInputElement>) =>
                            column.setFilterValue(e.target.value),
                        500,
                    )}
                />
            ),
        },
    }) as TableColumnDef<Product>,
	columnBuilder.accessor("description", {
        header: "Description",
        enableSorting: false
    }) as TableColumnDef<Product>,
];

// ProductTable component that uses the generic DataTable
export const ProductTable = ({
                                 options,
                                 features,
                                 children,
                             }: {
    options?: TableOptions;
    features?: {
        enableSorting?: boolean;
        enablePagination?: boolean;
        enableGlobalFilter?: boolean;
        enableColumnFilters?: boolean;
    };
    children?: React.ReactNode;
}) => {
    // Create the data provider
    const dataProvider = useMemo(() => {
        return new ProductDataProvider();
    }, []);

    return (
        <DataTable<Product, ProductResponse>
            columns={productColumns}
            options={options}
            dataProvider={dataProvider}
            features={features}
        >
            {children}
        </DataTable>
    );
};


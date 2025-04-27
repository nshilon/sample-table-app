import {
	DataTable,
	type ExtendedColumnDef,
	type TableSortingState,
} from "../DataTable";
import { debounce } from "../lib/utils";
import type { FetchOptions } from "../lib/dataCache";
import type React from "react";
import { type ChangeEvent, useMemo } from "react";
import { ProductDataProvider } from "./ProductDataProvider";
import type {Product, ProductResponse} from "./types.ts";



// Use FetchOptions from dataCache
export type Options = FetchOptions;

const baseApiUrl = import.meta.env.VITE_API_URL;

// Function to prefetch initial data
export const prefetchInitialData = () => {
	const provider = new ProductDataProvider(baseApiUrl);
	return provider.prefetchInitialData();
};

// Define columns for Product data
export const productColumns: ExtendedColumnDef<
	Product,
	{ filterComponent: any }
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
	{
		accessorKey: "price",
		header: "Price",
		enableSorting: true,
		cell: (info) => `$${info.getValue()}`,
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
	},
	{
		accessorKey: "stock",
		header: "Stock",
		enableSorting: true,
		cell: (info) => info.getValue(),
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
	},
	{
		accessorKey: "description",
		header: "Description",
		cell: (info) => info.getValue(),
		enableSorting: false,
		meta: {
			// filterComponent: (column: any) => (
			//     <input
			//         type="search"
			//         onChange={debounce((e: ChangeEvent<HTMLInputElement>) => column.setFilterValue(e.target.value), 500)}
			//     />
			// )
		},
	},
];

// ProductTable component that uses the generic DataTable
export const ProductTable = ({
	options,
	features,
	children,
}: {
	options?: Options;
	features?: {
		enableSorting?: boolean;
		enablePagination?: boolean;
		enableGlobalFilter?: boolean;
		enableColumnFilters?: boolean;
		initialPageSize?: number;
		initialSorting?: TableSortingState;
	};
	children?: React.ReactNode;
}) => {
	// Create the data provider
	const dataProvider = useMemo(() => {
		return new ProductDataProvider(baseApiUrl);
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

export default ProductTable;

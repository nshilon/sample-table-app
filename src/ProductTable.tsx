import {
	DataTable,
	type ExtendedColumnDef,
	type TableSortingState,
} from "./DataTable";
import { debounce } from "./lib/utils";
import type { FetchOptions } from "./lib/dataCache";
import type React from "react";
import { type ChangeEvent, useEffect, useMemo } from "react";
import { ProductDataProvider } from "./providers/ProductDataProvider";

// Product type definition
export type Product = {
	id: number;
	name: string;
	category: string;
	price: number;
	stock: number;
	description: string;
};

// Response type for Product data
export type ProductResponse = {
	first: number;
	prev: number;
	next: number;
	last: number;
	pages: number;
	items: number;
	data: Product[];
};

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

	// Effect to prefetch adjacent pages when the current page changes
	useEffect(() => {
		if (options?.pagination) {
			// Use a small timeout to not interfere with the current fetch
			const timeoutId = setTimeout(() => {
				dataProvider.prefetchAdjacentPages(options);
			}, 100);

			return () => clearTimeout(timeoutId);
		}
	}, [options?.pagination?.pageIndex, dataProvider]);

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

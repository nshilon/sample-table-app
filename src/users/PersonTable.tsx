import {
	DataTable,
	type ExtendedColumnDef, TableOptions,
	type TableSortingState,
} from "@/components/data-table";
import { debounce } from "../lib/utils";

import type React from "react";
import { type ChangeEvent, useMemo } from "react";
import { PersonDataProvider } from "./PersonDataProvider";
import type {Person, PersonResponse} from "./types.ts";


const baseApiUrl = import.meta.env.VITE_API_URL;

// // Function to prefetch initial data
// export const prefetchInitialData = () => {
// 	const provider = new PersonDataProvider(baseApiUrl);
// 	return provider.prefetchInitialData();
// };

// Define columns for Person data
export const personColumns: ExtendedColumnDef<
	Person,
	{ filterComponent: any }
>[] = [
	{
		accessorKey: "first_name",
		header: "First Name",
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
		accessorKey: "last_name",
		header: "Last Name",
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
		accessorKey: "email",
		header: "Email",
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
		accessorKey: "gender",
		header: "Gender",
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
		accessorKey: "ip_address",
		header: "IP Address",
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
];

// PersonTable component that uses the generic DataTable
export const PersonTable = ({
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
		initialPageSize?: number;
		initialSorting?: TableSortingState;
	};
	children?: React.ReactNode;
}) => {
	// Create the data provider
	const dataProvider = useMemo(() => {
		return new PersonDataProvider(baseApiUrl);
	}, []);

	return (
		<DataTable<Person, PersonResponse>
			columns={personColumns}
			options={options}
			dataProvider={dataProvider}
			features={features}
		>
			{children}
		</DataTable>
	);
};


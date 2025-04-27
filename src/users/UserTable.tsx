import {
	DataTable,
	type TableColumnDef, type TableOptions
} from "@/components/data-table";
import { debounce } from "../lib/utils";

import type React from "react";
import { type ChangeEvent, useMemo } from "react";
import { UserDataProvider } from "./UserDataProvider.ts";
import type {User, UserResponse} from "./types.ts";



// // Function to prefetch initial data
// export const prefetchInitialData = () => {
// 	const provider = new PersonDataProvider(baseApiUrl);
// 	return provider.prefetchInitialData();
// };

// Define columns for Person data
export const personColumns: TableColumnDef<
	User
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
export const UserTable = ({
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
		return new UserDataProvider();
	}, []);

	return (
		<DataTable<User, UserResponse>
			columns={personColumns}
			options={options}
			dataProvider={dataProvider}
			features={features}
		>
			{ features?.enableGlobalFilter && <DataTable.GlobalFilter/>}
			<DataTable.Header/>
			<DataTable.Body/>
			{ features?.enablePagination && <DataTable.Pagination/> }
			{children}
		</DataTable>
	);
};


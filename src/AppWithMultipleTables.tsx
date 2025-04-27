import "./App.css";
import {
	PersonTable,
	prefetchInitialData as prefetchPersonData,
} from "./PersonTable.tsx";
import {
	ProductTable,
	prefetchInitialData as prefetchProductData,
} from "./ProductTable.tsx";
import { useEffect, useState } from "react";
import {TableSortingState} from "./DataTable.tsx";

function AppWithMultipleTables() {
	// Define initial sorting states
	const initialPersonSorting: TableSortingState = [
		{
			id: "first_name",
			desc: false,
		},
	];

	const initialProductSorting: TableSortingState = [
		{
			id: "name",
			desc: false,
		},
	];

	// State to track which table is active
	const [activeTable, setActiveTable] = useState<"persons" | "products">(
		"persons",
	);

	// Prefetch initial data when component mounts
	useEffect(() => {
		prefetchPersonData();
		prefetchProductData();
	}, []);

	return (
		<div>
			<div style={{ marginBottom: "20px" }}>
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
						features={{
							enableSorting: true,
							enablePagination: true,
							enableGlobalFilter: true,
							// enableColumnFilters: true,
							initialPageSize: 10,
							initialSorting: initialPersonSorting,
						}}
					/>
				</div>
			) : (
				<div>
					<ProductTable
						features={{
							enableSorting: true,
							enablePagination: true,
							// enableGlobalFilter: true,
							enableColumnFilters: true,
							initialPageSize: 10,
							initialSorting: initialProductSorting,
						}}
					/>
				</div>
			)}
		</div>
	);
}

export default AppWithMultipleTables;

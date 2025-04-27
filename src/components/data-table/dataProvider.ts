import type { TableOptions } from "./DataTable";

/**
 * Generic DataProvider interface that defines the contract for data operations
 * used by the DataTable component.
 *
 * @template TData The type of data items displayed in the table
 * @template TResponse The type of the API response containing the data
 */
export interface DataProvider<TData, TResponse> {
	/**
	 * Fetches data based on the provided options
	 *
	 * @param options Table options including sorting, pagination, filters, etc.
	 * @returns Promise resolving to the response data
	 */
	fetchData(options: TableOptions): Promise<TResponse>;

	/**
	 * Extracts the row data from the response
	 *
	 * @param response The API response
	 * @returns Array of data items
	 */
	getRowData(response: TResponse): TData[];

	/**
	 * Gets the total count of rows from the response
	 *
	 * @param response The API response
	 * @returns Total number of items
	 */
	getRowCount(response: TResponse): number;

	/**
	 * Gets the total number of pages from the response
	 *
	 * @param response The API response
	 * @returns Total number of pages
	 */
	getPageCount(response: TResponse): number;

	/**
	 * Gets the initial data to display before any fetching occurs
	 *
	 * @returns The initial response data
	 */
	getInitialData(): TResponse;

	/**
	 * Optional method to prefetch adjacent pages for smoother pagination
	 *
	 * @param options Current table options
	 */
	prefetchAdjacentPages?(options: TableOptions): void;
}

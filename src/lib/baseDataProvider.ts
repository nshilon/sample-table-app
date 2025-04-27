import type { DataCache, FetchOptions } from "./dataCache";
import type { DataProvider } from "./dataProvider";
import type { TableOptions } from "../DataTable";

/**
 * Base implementation of DataProvider that uses DataCache
 *
 * @template TData The type of data items displayed in the table
 * @template TResponse The type of the API response containing the data
 */
export abstract class BaseDataProvider<TData, TResponse>
	implements DataProvider<TData, TResponse>
{
	protected dataCache: DataCache<TResponse>;
	protected initialData: TResponse;

	/**
	 * Creates a new BaseDataProvider
	 *
	 * @param dataCache The data cache instance to use
	 * @param initialData The initial data to use before any fetching occurs
	 */
	constructor(dataCache: DataCache<TResponse>, initialData: TResponse) {
		this.dataCache = dataCache;
		this.initialData = initialData;
	}

	/**
	 * Fetches data using the data cache
	 *
	 * @param options Table options
	 * @returns Promise resolving to the response data
	 */
	fetchData(options: TableOptions): Promise<TResponse> {
		return this.dataCache.fetchData(options as FetchOptions);
	}

	/**
	 * Gets the initial data
	 *
	 * @returns The initial response data
	 */
	getInitialData(): TResponse {
		return this.initialData;
	}

	/**
	 * Prefetches adjacent pages for smoother pagination
	 *
	 * @param options Current table options
	 */
	prefetchAdjacentPages(options: TableOptions): void {
		this.dataCache.prefetchAdjacentPages(options as FetchOptions);
	}

	/**
	 * Abstract method to extract row data from response
	 * Must be implemented by concrete providers
	 */
	abstract getRowData(response: TResponse): TData[];

	/**
	 * Abstract method to get row count from response
	 * Must be implemented by concrete providers
	 */
	abstract getRowCount(response: TResponse): number;

	/**
	 * Abstract method to get page count from response
	 * Must be implemented by concrete providers
	 */
	abstract getPageCount(response: TResponse): number;
}

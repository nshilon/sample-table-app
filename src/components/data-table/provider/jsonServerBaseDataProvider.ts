import {BaseDataProvider} from "@/components/data-table/provider/baseDataProvider.ts";

type TResponse<TData> = {
	first: number;
	prev: number;
	next: number;
	last: number;
	pages: number;
	items: number;
	data: TData[];
};

export class JsonServerBaseDataProvider<TData> extends BaseDataProvider<
	TData,
	TResponse<TData>
> {

		/**
	 * Extracts row data from the person response
	 *
	 * @param response Person API response
	 * @returns Array of person items
	 */
	getRowData(response: TResponse<TData>): TData[] {
		return response.data;
	}

	/**
	 * Gets the total count of rows from the person response
	 *
	 * @param response Person API response
	 * @returns Total number of items
	 */
	getRowCount(response: TResponse<TData>): number {
		return response.items;
	}

	/**
	 * Gets the total number of pages from the person response
	 *
	 * @param response Person API response
	 * @returns Total number of pages
	 */
	getPageCount(response: TResponse<TData>): number {
		return response.pages;
	}
}

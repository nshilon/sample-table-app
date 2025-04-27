import type {Person, PersonResponse} from "./types.ts";
import {BaseDataProvider, createDataCache} from "@/components/data-table/provider";

// Initial empty response for persons
export const initialPersonResponse: PersonResponse = {
	first: 0,
	prev: 0,
	next: 0,
	last: 0,
	pages: 0,
	items: 0,
	data: [],
};

/**
 * Person-specific implementation of DataProvider
 */
export class PersonDataProvider extends BaseDataProvider<
	Person,
	PersonResponse
> {
	/**
	 * Creates a new PersonDataProvider
	 *
	 * @param baseApiUrl Base API URL
	 */
	constructor(baseApiUrl: string) {
		// Create a person-specific data cache
		const personCache = createDataCache<PersonResponse>(
			baseApiUrl,
			"users",
			"first_name",
		);
		super(personCache, initialPersonResponse);
	}

	/**
	 * Extracts row data from the person response
	 *
	 * @param response Person API response
	 * @returns Array of person items
	 */
	getRowData(response: PersonResponse): Person[] {
		return response.data;
	}

	/**
	 * Gets the total count of rows from the person response
	 *
	 * @param response Person API response
	 * @returns Total number of items
	 */
	getRowCount(response: PersonResponse): number {
		return response.items;
	}

	/**
	 * Gets the total number of pages from the person response
	 *
	 * @param response Person API response
	 * @returns Total number of pages
	 */
	getPageCount(response: PersonResponse): number {
		return response.pages;
	}

	// /**
	//  * Prefetches initial data with default sorting
	//  *
	//  * @returns Promise resolving to the initial data
	//  */
	// prefetchInitialData() {
	// 	return this.dataCache.prefetchInitialData({
	// 		sorting: [{ id: "first_name", desc: false }],
	// 	});
	// }
}

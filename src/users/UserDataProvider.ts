import type {User, UserResponse} from "./types.ts";
import {createDataCache} from "@/components/data-table/provider";
import {JsonServerBaseDataProvider} from "@/components/data-table/provider/jsonServerBaseDataProvider.ts";

// Initial empty response for persons
export const initialResponse: UserResponse = {
	first: 0,
	prev: 0,
	next: 0,
	last: 0,
	pages: 0,
	items: 0,
	data: [],
};

const BASE_API_URL = import.meta.env.VITE_API_URL;

/**
 * Person-specific implementation of DataProvider
 */
export class UserDataProvider extends JsonServerBaseDataProvider<
	User
> {
	/**
	 * Creates a new PersonDataProvider
	 *
	 * @param baseApiUrl Base API URL
	 */
	constructor(baseApiUrl: string = BASE_API_URL) {
		// Create a person-specific data cache
		const personCache = createDataCache<UserResponse>(
			baseApiUrl,
			"users",
			"first_name",
		);
		super(personCache, initialResponse);
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

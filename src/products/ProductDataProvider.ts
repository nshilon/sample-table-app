import type {Product, ProductResponse} from "./types.ts";
import {createDataCache} from "@/components/data-table/provider";
import {JsonServerBaseDataProvider} from "@/components/data-table/provider/jsonServerBaseDataProvider.ts";


// Initial empty response for products
export const initialProductResponse: ProductResponse = {
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
 * Product-specific implementation of DataProvider
 */
export class ProductDataProvider extends JsonServerBaseDataProvider<
	Product
> {
	/**
	 * Creates a new ProductDataProvider
	 *
	 * @param baseApiUrl Base API URL
	 */
	constructor(baseApiUrl: string = BASE_API_URL) {
		// Create a product-specific data cache
		const productCache = createDataCache<ProductResponse>(
			baseApiUrl,
			"products",
			"name",
		);
		super(productCache, initialProductResponse);
	}

	/**
	 * Prefetches initial data with default sorting
	 *
	 * @returns Promise resolving to the initial data
	 */
	prefetchInitialData() {
		return this.dataCache.prefetchInitialData({
			sorting: [{ id: "name", desc: false }],
		});
	}
}

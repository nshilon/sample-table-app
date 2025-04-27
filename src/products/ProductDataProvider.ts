import type {Product, ProductResponse} from "./types.ts";
import {BaseDataProvider, createDataCache} from "@/components/data-table/provider";


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

/**
 * Product-specific implementation of DataProvider
 */
export class ProductDataProvider extends BaseDataProvider<
	Product,
	ProductResponse
> {
	/**
	 * Creates a new ProductDataProvider
	 *
	 * @param baseApiUrl Base API URL
	 */
	constructor(baseApiUrl: string) {
		// Create a product-specific data cache
		const productCache = createDataCache<ProductResponse>(
			baseApiUrl,
			"products",
			"name",
		);
		super(productCache, initialProductResponse);
	}

	/**
	 * Extracts row data from the product response
	 *
	 * @param response Product API response
	 * @returns Array of product items
	 */
	getRowData(response: ProductResponse): Product[] {
		return response.data;
	}

	/**
	 * Gets the total count of rows from the product response
	 *
	 * @param response Product API response
	 * @returns Total number of items
	 */
	getRowCount(response: ProductResponse): number {
		return response.items;
	}

	/**
	 * Gets the total number of pages from the product response
	 *
	 * @param response Product API response
	 * @returns Total number of pages
	 */
	getPageCount(response: ProductResponse): number {
		return response.pages;
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

import { ColumnFiltersState, PaginationState, SortingState } from "@tanstack/react-table";

// Generic options type for fetching data
export type FetchOptions = {
    sorting?: SortingState;
    pagination?: PaginationState;
    columnFilters?: ColumnFiltersState;
    globalFilter?: string;
    [key: string]: any; // Allow for additional custom options
};

// Generic cache class that can be used for any data type
export class DataCache<T> {
    private cache = new Map<string, Promise<T>>();
    private endpoint: string;
    private baseUrl: string;
    private globalFilterField?: string;

    constructor(
        baseUrl: string, 
        endpoint: string, 
        globalFilterField?: string
    ) {
        this.baseUrl = baseUrl;
        this.endpoint = endpoint;
        this.globalFilterField = globalFilterField;
    }

    // Generate a cache key from options
    getCacheKey(options: FetchOptions): string {
        const sortKey = options.sorting && options.sorting.length > 0 
            ? options.sorting.map(s => `${s.id}:${s.desc}`).join(',') 
            : '';
        
        const pageKey = options.pagination 
            ? `page=${options.pagination.pageIndex},size=${options.pagination.pageSize}` 
            : 'page=0,size=10';
        
        const filterKey = options.globalFilter || '';
        
        const columnFilterKey = options.columnFilters && options.columnFilters.length > 0 
            ? options.columnFilters.map(f => `${f.id}:${f.value}`).join(',') 
            : '';
        
        // Include any custom options in the cache key
        const customKeys = Object.entries(options)
            .filter(([key]) => !['sorting', 'pagination', 'columnFilters', 'globalFilter'].includes(key))
            .map(([key, value]) => `${key}:${JSON.stringify(value)}`)
            .join('|');

        return `${this.endpoint}|${sortKey}|${pageKey}|${filterKey}|${columnFilterKey}${customKeys ? '|' + customKeys : ''}`;
    }

    // Fetch data with caching
    async fetchData(options: FetchOptions): Promise<T> {
        // Generate cache key
        const cacheKey = this.getCacheKey(options);
        
        // Check if we have cached data
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey)!;
        }

        // Build the URL with query parameters
        let url = `${this.baseUrl}/${this.endpoint}?`;

        // Add sorting parameters
        if (options.sorting && options.sorting.length > 0) {
            if (!url.endsWith('?')) {
                url += '&';
            }
            url += "_sort=" + options.sorting.map(sort => `${sort.desc ? '-' : ''}${sort.id}`).join(',');
        }

        // Add pagination parameters
        if (options.pagination) {
            if (!url.endsWith('?')) {
                url += '&';
            }
            url += `_page=${options.pagination.pageIndex + 1}&_per_page=${options.pagination.pageSize}`;
        } else {
            // Default pagination if not provided
            if (!url.endsWith('?')) {
                url += '&';
            }
            url += `_page=1&_per_page=10`;
        }

        // Add global filter parameter
        if (options.globalFilter && this.globalFilterField) {
            if (!url.endsWith('?')) {
                url += '&';
            }
            url += `${this.globalFilterField}=${options.globalFilter}`;
        }

        // Add column filters parameters
        if (options.columnFilters && options.columnFilters.length > 0) {
            if (!url.endsWith('?')) {
                url += '&';
            }
            url += options.columnFilters.map(filter => `&${filter.id}=${filter.value}`).join('');
        }

        // Create the promise for fetching data
        const fetchPromise = fetch(url).then(response => response.json());
        
        // Store in cache
        this.cache.set(cacheKey, fetchPromise);
        
        return fetchPromise;
    }

    // Prefetch adjacent pages
    prefetchAdjacentPages(currentOptions: FetchOptions): void {
        if (!currentOptions.pagination) return;
        
        const { pageIndex, pageSize } = currentOptions.pagination;
        
        // Prefetch next page if not the last page
        if (pageIndex < 1000) { // Assuming a max of 1000 pages
            const nextPageOptions = {
                ...currentOptions,
                pagination: { pageIndex: pageIndex + 1, pageSize }
            };
            this.fetchData(nextPageOptions);
        }
        
        // Prefetch previous page if not the first page
        if (pageIndex > 0) {
            const prevPageOptions = {
                ...currentOptions,
                pagination: { pageIndex: pageIndex - 1, pageSize }
            };
            this.fetchData(prevPageOptions);
        }
    }

    // Prefetch initial data
    prefetchInitialData(initialOptions: Partial<FetchOptions> = {}): Promise<T> {
        // Prefetch first page with default settings
        return this.fetchData({
            ...initialOptions,
            pagination: { pageIndex: 0, pageSize: 10, ...initialOptions.pagination }
        });
    }

    // Clear the entire cache
    clearCache(): void {
        this.cache.clear();
    }

    // Remove a specific entry from the cache
    invalidateCache(options: FetchOptions): void {
        const cacheKey = this.getCacheKey(options);
        this.cache.delete(cacheKey);
    }
}

// Create a factory function to easily create data caches for different entity types
export function createDataCache<T>(
    baseUrl: string, 
    endpoint: string, 
    globalFilterField?: string
): DataCache<T> {
    return new DataCache<T>(baseUrl, endpoint, globalFilterField);
}

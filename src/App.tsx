import "./App.css";
import {PersonTable, fetchUsers, Options, prefetchAdjacentPages} from "./PersonTable.tsx";
import {useState, useTransition, useEffect} from "react";
import {isFunction, Updater} from "@tanstack/react-table";

import {debounce} from "./lib/utils";

function App() {
    // Use transition to avoid showing the Suspense fallback during transitions
    const [isPending, startTransition] = useTransition();

    const [options, setOptions] = useState<Options>({
        pagination: {
            pageIndex: 0,
            pageSize: 10
        },
        sorting: [{
            id: 'first_name',
            desc: false
        }],
        columnFilters: [],
        globalFilter: '',
    });

    // Wrap setOptions in startTransition to mark state updates as non-urgent
    const updateOptions = (updater: (prev: Options) => Options) => {
        startTransition(() => {
            setOptions(updater);
        });
    };

    const p = fetchUsers(options);

    // Effect to prefetch adjacent pages when the current page changes
    useEffect(() => {
        if (options.pagination) {
            // Use a small timeout to not interfere with the current fetch
            const timeoutId = setTimeout(() => {
                prefetchAdjacentPages(options);
            }, 100);

            return () => clearTimeout(timeoutId);
        }
    }, [options.pagination?.pageIndex]);

    const handleGlobalFilterChange = debounce((updateGlobalFilter: unknown) => {
        updateOptions(prev => ({
            ...prev,
            globalFilter: isFunction(updateGlobalFilter) ? updateGlobalFilter(prev.globalFilter!) : updateGlobalFilter
        }));
    }, 500);

    return (
        <div style={{opacity: isPending ? 0.7 : 1, transition: 'opacity 0.2s'}}>
            <div>
                <input placeholder="Search..." type="search" onChange={e => handleGlobalFilterChange(e.target.value)}/>
            </div>


            <PersonTable
                getData={p}
                options={options}
                onPaginationChange={debounce((updatePagination: Updater<Options['pagination']>) => {
                    updateOptions(prev => ({
                        ...prev,
                        pagination: isFunction(updatePagination) ? updatePagination(prev.pagination!) : updatePagination
                    }));
                }, 100)}
                onSortingChange={debounce((updateSorting: Updater<Options['sorting']>) => {
                    updateOptions(prev => ({
                        ...prev,
                        // pagination: {pageIndex: 0, pageSize: prev.pagination?.pageSize || 10},
                        sorting: isFunction(updateSorting) ? updateSorting(prev.sorting!) : [...prev.sorting || [], ...updateSorting || []]
                    }));
                }, 100)}
                onGlobalFilterChange={debounce((updateGlobalFilter: Updater<Options['globalFilter']>) => {
                    updateOptions(prev => ({
                        ...prev,
                        pagination: {pageIndex: 0, pageSize: prev.pagination?.pageSize || 10},
                        globalFilter: isFunction(updateGlobalFilter) ? updateGlobalFilter(prev.globalFilter!) : updateGlobalFilter
                    }));
                }, 500)}
                onColumnFiltersChange={debounce((updateColumnFilters: Updater<Options['columnFilters']>) => {
                    updateOptions(prev => ({
                        ...prev,
                        pagination: {pageIndex: 0, pageSize: prev.pagination?.pageSize || 10},
                        columnFilters: isFunction(updateColumnFilters) ? updateColumnFilters(prev.columnFilters!) : [...prev.columnFilters || [], ...updateColumnFilters || []]
                    }));
                }, 500)}
            />


        </div>
    );
}

export default App;

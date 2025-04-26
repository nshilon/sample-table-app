import "./App.css";
import DataTable, {fetchUsers, Options} from "./DataTable.tsx";
import {Suspense, useState, useTransition} from "react";
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

	const handleGlobalFilterChange = debounce((updateGlobalFilter: unknown) => {
        updateOptions(prev => ({
            ...prev,
            globalFilter: isFunction(updateGlobalFilter) ? updateGlobalFilter(prev.globalFilter!) : updateGlobalFilter
        }));
    }, 500);

    return (
        <>
            <div>
                <input placeholder="Search..." type="search" onChange={e => handleGlobalFilterChange(e.target.value)} />
            </div>


            <Suspense fallback={<div>Loading...</div>}>
                <DataTable getData={p} options={options}
                           onPaginationChange={((updatePagination: Updater<Options['pagination']>) => {
                               updateOptions(prev => ({
                                   ...prev,
                                   pagination: isFunction(updatePagination) ? updatePagination(prev.pagination!) : updatePagination
                               }));
                           })}
                           onSortingChange={(updateSorting: Updater<Options['sorting']>) => {
                               updateOptions(prev => ({
                                   ...prev,
                                   // pagination: {pageIndex: 0, pageSize: prev.pagination?.pageSize || 10},
                                   sorting: isFunction(updateSorting) ? updateSorting(prev.sorting!) : [...prev.sorting || [], ...updateSorting || []]
                               }));
                           }}
                           onGlobalFilterChange={debounce((updateGlobalFilter: Updater<Options['globalFilter']>) => {
                               updateOptions(prev => ({
                                   ...prev,
                                   pagination: {pageIndex: 0, pageSize: prev.pagination?.pageSize || 10},
                                   globalFilter: isFunction(updateGlobalFilter) ? updateGlobalFilter(prev.globalFilter!) : updateGlobalFilter
                               }));
                           }, 500)}
                           onColumnFiltersChange={debounce((updateColumnFilters: Updater<Options['columnFilters']>)  => {
                               updateOptions(prev => ({
                                   ...prev,
                                   pagination: {pageIndex: 0, pageSize: prev.pagination?.pageSize || 10},
                                   columnFilters: isFunction(updateColumnFilters) ? updateColumnFilters(prev.columnFilters!) : [...prev.columnFilters || [], ...updateColumnFilters || []]
                               }));
                           }, 500)}>
                    {isPending && <div className="transition-indicator">Updating...</div>}

                </DataTable>

            </Suspense>
            {/* Add a loading indicator that shows during transitions */}

        </>

    );
}

export default App;

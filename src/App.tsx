import "./App.css";
import DataTable, {fetchUsers, Options} from "./DataTable.tsx";
import {Suspense, useState} from "react";
import {isFunction, Updater} from "@tanstack/react-table";

import {debounce} from "./lib/utils";

function App() {

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
    })

    const
        p = fetchUsers(options);

	const handleGlobalFilterChange = debounce((updateGlobalFilter: unknown) => {
							   setOptions(prev => ({
							       ...prev,
							       globalFilter: isFunction(updateGlobalFilter) ? updateGlobalFilter(prev.globalFilter!) : updateGlobalFilter
							   }))
						   }, 500);

    return (
        <>


			        <div>
            <input placeholder="Search..." type="search" onChange={e => handleGlobalFilterChange(e.target.value)} />
        </div>

            <Suspense fallback={<div>Loading...</div>}>
                <DataTable getData={p} options={options}
                           onPaginationChange={((updatePagination) => {
                               setOptions(prev =>
                                   ({
                                       ...prev,
                                       pagination: isFunction(updatePagination) ? updatePagination(prev.pagination!) : updatePagination
                                   }))
                           })}
                           onSortingChange={(updateSorting) => {
							   setOptions(prev => ({
							       ...prev,
								   // pagination: {pageIndex: 0, pageSize: prev.pagination?.pageSize || 10},
							       sorting: isFunction(updateSorting) ? updateSorting(prev.sorting!) : [...prev.sorting || [], ...updateSorting || []]
							   }))
						   }}
                           onGlobalFilterChange={debounce((updateGlobalFilter: Updater<Options['globalFilter']>) => {
							   setOptions(prev => ({
							       ...prev,
								   pagination: {pageIndex: 0, pageSize: prev.pagination?.pageSize || 10},
							       globalFilter: isFunction(updateGlobalFilter) ? updateGlobalFilter(prev.globalFilter!) : updateGlobalFilter
							   }))
						   }, 500)}
                           onColumnFiltersChange={debounce((updateColumnFilters: Updater<Options['columnFilters']>)  => {
							   setOptions(prev => ({
							       ...prev,
								   pagination: {pageIndex: 0, pageSize: prev.pagination?.pageSize || 10},
							       columnFilters: isFunction(updateColumnFilters) ? updateColumnFilters(prev.columnFilters!) : [...prev.columnFilters || [], ...updateColumnFilters || []]
							   }))
						   }, 500)}/>

            </Suspense>
        </>

    );
}

export default App;

import "./App.css";
import {PersonTable, fetchUsers, prefetchInitialData} from "./PersonTable.tsx";
import {SortingState} from "@tanstack/react-table";
import {useEffect} from "react";

function App() {
    // Define initial sorting state
    const initialSorting: SortingState = [{
        id: 'first_name',
        desc: false
    }];

    // Prefetch initial data when component mounts
    useEffect(() => {
        prefetchInitialData();
    }, []);

    // Create a promise to fetch data with no initial options
    const p = fetchUsers({});

    return (
        <div>
            <PersonTable
                getData={p}
                features={{
                    enableSorting: true,
                    enablePagination: true,
                    enableGlobalFilter: true,
                    enableColumnFilters: true,
                    initialPageSize: 10,
                    initialSorting: initialSorting
                }}
            />
        </div>
    );
}

export default App;

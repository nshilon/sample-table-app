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

    return (
        <div>
            <PersonTable
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

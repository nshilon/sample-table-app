
import { createRoot } from "react-dom/client";
import "./index.css";
import AppWithMultipleTables from "./AppWithMultipleTables.tsx";

const root = document.getElementById("root");

if (root) {
	createRoot(root).render(


		<AppWithMultipleTables />
		,
	);
}

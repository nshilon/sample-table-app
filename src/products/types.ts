// Product type definition
export type Product = {
	id: number;
	name: string;
	category: string;
	price: number;
	stock: number;
	description: string;
};

// Response type for Product data
export type ProductResponse = {
	first: number;
	prev: number;
	next: number;
	last: number;
	pages: number;
	items: number;
	data: Product[];
};
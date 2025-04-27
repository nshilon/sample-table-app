       // Person type definition
export type Person = {
	id: number;
	first_name: string;
	last_name: string;
	email: string;
	gender: string;
	ip_address: string;
};

// Response type for Person data
export type PersonResponse = {
	first: number;
	prev: number;
	next: number;
	last: number;
	pages: number;
	items: number;
	data: Person[];
};
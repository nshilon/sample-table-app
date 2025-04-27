       // Person type definition
export type User = {
	id: number;
	first_name: string;
	last_name: string;
	email: string;
	gender: string;
	ip_address: string;
};

// Response type for Person data
export type UserResponse = {
	first: number;
	prev: number;
	next: number;
	last: number;
	pages: number;
	items: number;
	data: User[];
};
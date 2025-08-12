export type Customer = {
  id: string;
  name: string;
  town: string;
  address: string;
  contactPerson: string;
  phone: string;
  email: string;
  status: "Active" | "Inactive" | "Lead";
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  size: string;
};

export type Interaction = {
  id: string;
  customerId: string;
  type: "Call" | "Email" | "Meeting";
  date: string;
  notes: string;
};

export type Reminder = {
  id: string;
  customerId: string;
  date: string;
  notes: string;
};

export const customers: Customer[] = [];

export const products: Product[] = [];

export const interactions: Interaction[] = [];

export const reminders: Reminder[] = [];

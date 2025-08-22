export type Customer = {
  id: string;
  name: string;
  town: string;
  address: string;
  contactPerson: string;
  phone: string;
  email: string;
  status: "Active" | "Inactive" | "Lead";
  storefrontImage?: string;
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
  type: "Call" | "Email" | "Meeting" | "Competitor Activity";
  date: string;
  notes: string;
};

export type Reminder = {
  id: string;
  customerId?: string;
  date: string;
  notes: string;
  isComplete: boolean;
};

export type Order = {
    id: string;
    customerId: string;
    date: string;
    items: Map<string, number>; // productId -> quantity
}

export type StockReturn = {
    id: string;
    customerId: string;
    date: string;
    items: Map<string, number>; // productId -> quantity
    reason: string;
}

export const customers: Customer[] = [];

export const products: Product[] = [];

export const interactions: Interaction[] = [];

export const reminders: Reminder[] = [];

export const orders: Order[] = [];

export const stockReturns: StockReturn[] = [];

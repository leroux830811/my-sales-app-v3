export type Customer = {
  id: string;
  name: string;
  company: string;
  email: string;
  lastInteraction: string;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
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

export const customers: Customer[] = [
  { id: '1', name: 'John Smith', company: 'Gourmet Foods Inc.', email: 'john.s@gourmetfoods.com', lastInteraction: '2023-10-26' },
  { id: '2', name: 'Maria Garcia', company: 'The Deli Stop', email: 'maria.g@delistop.net', lastInteraction: '2023-10-25' },
  { id: '3', name: 'Chen Wei', company: 'Artisan Meats', email: 'w.chen@artisanmeats.co', lastInteraction: '2023-10-22' },
  { id: '4', name: 'Fatima Al-Fassi', company: 'Continental Catering', email: 'fatima.a@continental.com', lastInteraction: '2023-10-20' },
  { id: '5', name: 'David Miller', company: "Miller's Fine Meats", email: 'dave@millersmeats.com', lastInteraction: '2023-10-19' },
];

export const products: Product[] = [
  { id: 'p1', name: 'Prosciutto di Parma', description: 'Aged 18 months, sweet and delicate flavor.', price: 25.99, stock: 150, image: 'https://placehold.co/600x400.png', },
  { id: 'p2', name: 'Spanish Chorizo', description: 'Smoky and spicy, perfect for tapas.', price: 12.50, stock: 200, image: 'https://placehold.co/600x400.png', },
  { id: 'p3', name: 'Black Forest Ham', description: 'Naturally smoked over pine and fir.', price: 15.00, stock: 120, image: 'https://placehold.co/600x400.png', },
  { id: 'p4', name: 'Genoa Salami', description: 'Mild salami with a hint of garlic and wine.', price: 9.75, stock: 300, image: 'https://placehold.co/600x400.png', },
  { id: 'p5', name: 'Mortadella', description: 'Classic Italian luncheon meat with pistachios.', price: 8.50, stock: 180, image: 'https://placehold.co/600x400.png', },
  { id: 'p6', name: 'Soppressata', description: 'Coarsely ground, rustic Italian salami.', price: 18.25, stock: 90, image: 'https://placehold.co/600x400.png', },
];

export const interactions: Interaction[] = [
  { id: 'i1', customerId: '1', type: 'Email', date: '2023-10-26', notes: 'Sent follow-up about new shipment of Prosciutto.' },
  { id: 'i2', customerId: '2', type: 'Call', date: '2023-10-25', notes: 'Discussed bulk pricing for Chorizo. Sent quote.' },
  { id: 'i3', customerId: '3', type: 'Meeting', date: '2023-10-22', notes: 'Met at their location, provided samples of Black Forest Ham.' },
  { id: 'i4', customerId: '1', type: 'Call', date: '2023-10-15', notes: 'Initial call to introduce our new product line.' },
  { id: 'i5', customerId: '4', type: 'Email', date: '2023-10-20', notes: 'Answered questions about Mortadella ingredients for allergy concerns.' },
  { id: 'i6', customerId: '5', type: 'Email', date: '2023-10-19', notes: 'Confirmed order for Genoa Salami.' },
];

export const reminders: Reminder[] = [
  { id: 'r1', customerId: '2', date: '2023-11-01', notes: 'Follow up on the Chorizo quote.' },
  { id: 'r2', customerId: '3', date: '2023-11-05', notes: 'Check in about the ham samples.' },
  { id: 'r3', customerId: '1', date: '2023-11-10', notes: 'Ask about their interest in Soppressata.' },
  { id: 'r4', customerId: '4', date: '2023-11-12', notes: 'Send seasonal promotions email.' },
];

// Add data-ai-hint attributes to product images
products[0].image = 'https://placehold.co/600x400.png" data-ai-hint="cured ham';
products[1].image = 'https://placehold.co/600x400.png" data-ai-hint="spicy sausage';
products[2].image = 'https://placehold.co/600x400.png" data-ai-hint="smoked ham';
products[3].image = 'https://placehold.co/600x400.png" data-ai-hint="salami slices';
products[4].image = 'https://placehold.co/600x400.png" data-ai-hint="deli meat';
products[5].image = 'https://placehold.co/600x400.png" data-ai-hint="cured salami';

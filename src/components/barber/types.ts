export type Service = {
  serviceid: number;
  name: string;
  duration: number;
  price: number;
  img_url?: string | null;
};

export type Client = {
  clientid: number;
  personid: number;
  dni: string;
  name: string;
  last_name: string;
  email: string;
  address: string;
  phone: string;
  ruc: string;
};

export type Employee = {
  empid: number;
  personid: number;
  dni: string;
  name: string;
  last_name: string;
  email: string;
  phone: string;
};

export type Appointment = {
  appoid: number;
  date: string;
  start_time: string;
  end_time: string;
  description: string;
  status: string;
  empid: number;
  clientid: number;
  employee_name: string;
  employee_last_name: string;
  client_name: string;
  client_last_name: string;
};

export type Product = {
  productid: number;
  name: string;
  code: string;
  stock: string;
  price: number;
  description?: string;
};

export type Invoice = {
  inv_heaid: number;
  code: string;
  payment_method: string;
  total: number;
  status: string;
  clientid?: number | null;
  appoid?: number | null;
  client_name?: string | null;
  client_last_name?: string | null;
};

export type InvoiceDetail = {
  serviceid?: number | null;
  productid?: number | null;
  quantity: number;
  unit_price: number;
  total: number;
  service_name?: string | null;
  product_name?: string | null;
};

export type InvoiceWithDetails = Invoice & {
  details: InvoiceDetail[];
};

export type PendingPaymentInvoice = {
  inv_heaid: number;
  code: string;
  total: number;
  paymentMethod: string;
};

export type AuthenticatedUser = {
  username: string;
  last_name?: string;
  role?: string;
  empid?: number;
};

export type PanelSection = "dashboard" | "appointments" | "clients" | "services" | "billing" | "administration" | "administration-users";

export type EmployeeForm = {
  dni: string;
  name: string;
  last_name: string;
  email: string;
  address: string;
  phone: string;
  hire_date: string;
};

export type UserForm = {
  dni: string;
  username: string;
  password: string;
  role: "adm" | "emp";
};

export const emptyEmployee: EmployeeForm = {
  dni: "",
  name: "",
  last_name: "",
  email: "",
  address: "",
  phone: "",
  hire_date: new Date().toISOString().slice(0, 10),
};

export const emptyUser: UserForm = {
  dni: "",
  username: "",
  password: "",
  role: "emp",
};

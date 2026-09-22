"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { AdministrationPanel } from "@/components/barber/AdministrationPanel";
import { AppointmentsPanel } from "@/components/barber/AppointmentsPanel";
import { BillingPanel } from "@/components/barber/BillingPanel";
import { ClientsPanel } from "@/components/barber/ClientsPanel";
import { DashboardView } from "@/components/barber/DashboardView";
import { LoginScreen } from "@/components/barber/LoginScreen";
import { PanelNavigation } from "@/components/barber/PanelNavigation";
import { ServicesPanel } from "@/components/barber/ServicesPanel";
import { emptyEmployee, emptyUser, type Appointment, type AuthenticatedUser, type Client, type Employee, type EmployeeForm, type Invoice, type PanelSection, type Product, type Service, type UserForm } from "@/components/barber/types";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
const sessionKey = "barberhub.session";

type AdministrationTab = "employee" | "user";

export default function Home() {
  const [user, setUser] = useState<AuthenticatedUser | null>(() => {
    if (typeof window === "undefined") return null;
    const savedSession = window.localStorage.getItem(sessionKey);
    if (!savedSession) return null;
    try {
      return JSON.parse(savedSession) as AuthenticatedUser;
    } catch {
      window.localStorage.removeItem(sessionKey);
      return null;
    }
  });
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [activeSection, setActiveSection] = useState<PanelSection>("dashboard");
  const [administrationTab, setAdministrationTab] = useState<AdministrationTab>("employee");
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [employeeForm, setEmployeeForm] = useState<EmployeeForm>(emptyEmployee);
  const [userForm, setUserForm] = useState<UserForm>(emptyUser);
  const [employeeError, setEmployeeError] = useState("");
  const [employeeMessage, setEmployeeMessage] = useState("");
  const [userError, setUserError] = useState("");
  const [userMessage, setUserMessage] = useState("");
  const [isCreatingEmployee, setIsCreatingEmployee] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  useEffect(() => {
    if (!user) return;
    async function loadServices() {
      try {
        setIsLoading(true);
        setHasError(false);
        const response = await fetch(`${apiUrl}/api/services`);
        if (!response.ok) throw new Error("No se pudieron cargar los servicios");
        setServices(await response.json());
      } catch {
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    }
    void loadServices();
    async function loadClients() {
      try {
        const response = await fetch(`${apiUrl}/api/clients`);
        if (!response.ok) throw new Error("No se pudieron cargar los clientes");
        setClients(await response.json());
      } catch {
        setClients([]);
      }
    }
    void loadClients();
    async function loadAppointments() {
      try {
        const response = await fetch(`${apiUrl}/api/appointments`);
        if (!response.ok) throw new Error("No se pudieron cargar las citas");
        setAppointments(await response.json());
      } catch {
        setAppointments([]);
      }
    }
    void loadAppointments();
    async function loadEmployees() {
      try {
        const response = await fetch(`${apiUrl}/api/employees`);
        if (!response.ok) throw new Error("No se pudieron cargar los empleados");
        setEmployees(await response.json());
      } catch {
        setEmployees([]);
      }
    }
    void loadEmployees();
    async function loadProducts() {
      try {
        const response = await fetch(`${apiUrl}/api/products`);
        if (!response.ok) throw new Error("No se pudieron cargar los productos");
        setProducts(await response.json());
      } catch {
        setProducts([]);
      }
    }
    void loadProducts();
    async function loadInvoices() {
      try {
        const response = await fetch(`${apiUrl}/api/invoices`);
        if (!response.ok) throw new Error("No se pudieron cargar las facturas");
        setInvoices(await response.json());
      } catch {
        setInvoices([]);
      }
    }
    void loadInvoices();
  }, [user]);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoginError("");
    setIsLoggingIn(true);
    try {
      const response = await fetch(`${apiUrl}/api/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, password }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.detail ?? "No se pudo iniciar sesión");
      const authenticatedUser: AuthenticatedUser = { username: result.username, last_name: result.last_name, role: result.role, empid: result.empid };
      window.localStorage.setItem(sessionKey, JSON.stringify(authenticatedUser));
      setUser(authenticatedUser);
      setPassword("");
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : "No se pudo conectar con la API");
    } finally {
      setIsLoggingIn(false);
    }
  }

  function handleLogout() {
    window.localStorage.removeItem(sessionKey);
    setUser(null);
    setServices([]);
    setClients([]);
    setAppointments([]);
    setEmployees([]);
    setProducts([]);
    setInvoices([]);
    setActiveSection("dashboard");
  }

  function updateEmployeeField(field: keyof EmployeeForm, value: string) {
    setEmployeeForm((current) => ({ ...current, [field]: value }));
  }

  function updateUserField(field: keyof UserForm, value: string) {
    setUserForm((current) => ({ ...current, [field]: value }));
  }

  async function handleCreateEmployee(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setEmployeeError("");
    setEmployeeMessage("");
    setIsCreatingEmployee(true);
    try {
      const response = await fetch(`${apiUrl}/api/employee`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(employeeForm) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.detail ?? "No se pudo registrar el empleado");
      setEmployeeMessage("Empleado registrado correctamente. Ahora puedes crear su usuario.");
      setUserForm((current) => ({ ...current, dni: employeeForm.dni }));
      setEmployeeForm(emptyEmployee);
    } catch (error) {
      setEmployeeError(error instanceof Error ? error.message : "No se pudo registrar el empleado");
    } finally {
      setIsCreatingEmployee(false);
    }
  }

  async function handleCreateUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setUserError("");
    setUserMessage("");
    setIsCreatingUser(true);
    try {
      const response = await fetch(`${apiUrl}/api/appuser`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(userForm) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.detail ?? "No se pudo crear el usuario");
      setUserMessage("Usuario creado correctamente.");
      setUserForm(emptyUser);
    } catch (error) {
      setUserError(error instanceof Error ? error.message : "No se pudo crear el usuario");
    } finally {
      setIsCreatingUser(false);
    }
  }

  async function refreshServices() {
    try {
      const response = await fetch(`${apiUrl}/api/services`);
      if (!response.ok) throw new Error("No se pudieron cargar los servicios");
      setServices(await response.json());
      setHasError(false);
    } catch {
      setHasError(true);
    }
  }

  async function refreshClients() {
    try {
      const response = await fetch(`${apiUrl}/api/clients`);
      if (!response.ok) throw new Error("No se pudieron cargar los clientes");
      setClients(await response.json());
    } catch {
      setClients([]);
    }
  }

  async function refreshAppointments() {
    try {
      const response = await fetch(`${apiUrl}/api/appointments`);
      if (!response.ok) throw new Error("No se pudieron cargar las citas");
      setAppointments(await response.json());
    } catch {
      setAppointments([]);
    }
  }

  async function refreshInvoices() {
    try {
      const response = await fetch(`${apiUrl}/api/invoices`);
      if (!response.ok) throw new Error("No se pudieron cargar las facturas");
      setInvoices(await response.json());
    } catch {
      setInvoices([]);
    }
  }

  if (!user) {
    return <LoginScreen username={username} password={password} error={loginError} isSubmitting={isLoggingIn} onUsernameChange={setUsername} onPasswordChange={setPassword} onSubmit={handleLogin} />;
  }

  const isAdministration = activeSection === "administration" || activeSection === "administration-users";
  const sectionLabel = activeSection === "appointments" ? "Citas" : activeSection === "clients" ? "Clientes" : activeSection === "services" ? "Servicios" : "Facturación";

  return (
    <main className="min-h-screen bg-[#f4efe8] px-4 py-4 text-[#2c2520] sm:px-8 lg:px-10">
      <div className="mx-auto flex max-w-[1500px] gap-6">
        <PanelNavigation user={user} activeSection={activeSection} onSectionChange={(section) => { setActiveSection(section); if (section === "administration") setAdministrationTab("employee"); }} onLogout={handleLogout} />
        <div className="min-w-0 flex-1">
          <header className="flex flex-col justify-between gap-6 border-b border-[#d9cec1] pb-8 sm:flex-row sm:items-end">
            <div><p className="mb-3 text-sm font-semibold uppercase tracking-[0.28em] text-[#9b5b3b]">AlvaBarber / Panel</p><h1 className="font-serif text-5xl leading-none sm:text-6xl">Buenos días, {user.last_name || user.username}.</h1><p className="mt-4 max-w-xl text-[#75675d]">Tu operación de hoy, clara y lista para atender a cada cliente.</p></div>
            <div className="flex items-center gap-4"><span className="text-right text-sm text-[#75675d]"><strong className="block text-[#2c2520]">{user.username}</strong>{user.role === "adm" ? "Administrador" : "Empleado"}</span><button type="button" onClick={handleLogout} className="w-fit bg-[#2c2520] px-5 py-3 text-sm font-semibold text-[#fffaf4] transition hover:bg-[#9b5b3b] lg:hidden">Cerrar sesión</button></div>
          </header>
          {user.role === "adm" && isAdministration && <AdministrationPanel activeTab={activeSection === "administration-users" ? "user" : administrationTab} employeeForm={employeeForm} userForm={userForm} employeeError={employeeError} employeeMessage={employeeMessage} userError={userError} userMessage={userMessage} isCreatingEmployee={isCreatingEmployee} isCreatingUser={isCreatingUser} onTabChange={(tab) => { setAdministrationTab(tab); setActiveSection(tab === "user" ? "administration-users" : "administration"); }} onEmployeeFieldChange={updateEmployeeField} onUserFieldChange={updateUserField} onCreateEmployee={handleCreateEmployee} onCreateUser={handleCreateUser} />}
          {activeSection === "dashboard" && <DashboardView services={services} isLoading={isLoading} hasError={hasError} />}
          {activeSection === "services" && <ServicesPanel apiUrl={apiUrl} user={user} services={services} onChanged={() => void refreshServices()} />}
          {activeSection === "clients" && <ClientsPanel apiUrl={apiUrl} clients={clients} onChanged={() => void refreshClients()} />}
          {activeSection === "appointments" && <AppointmentsPanel apiUrl={apiUrl} currentEmployeeId={user.empid} appointments={appointments} clients={clients} employees={employees} onChanged={() => void refreshAppointments()} />}
          {activeSection === "billing" && <BillingPanel apiUrl={apiUrl} clients={clients} appointments={appointments} services={services} products={products} invoices={invoices} onChanged={() => void refreshInvoices()} />}
          {activeSection !== "dashboard" && activeSection !== "services" && activeSection !== "clients" && activeSection !== "appointments" && activeSection !== "billing" && !isAdministration && <section className="py-8"><div className="border-b border-[#d9cec1] pb-6"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#9b5b3b]">Módulo</p><h2 className="mt-2 font-serif text-4xl">{sectionLabel}</h2><p className="mt-3 text-[#75675d]">Este espacio está listo para conectar las operaciones de {sectionLabel.toLowerCase()}.</p></div><div className="mt-8 border border-dashed border-[#cbbdaf] bg-[#fffaf4] p-8"><p className="font-serif text-2xl">Módulo en preparación</p><p className="mt-2 max-w-xl text-[#75675d]">La navegación ya está disponible. El siguiente paso será conectar esta vista con sus endpoints correspondientes.</p></div></section>}
        </div>
      </div>
    </main>
  );
}

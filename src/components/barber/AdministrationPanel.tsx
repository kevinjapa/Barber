import type { FormEvent } from "react";
import type { EmployeeForm, UserForm } from "./types";

type AdministrationPanelProps = {
  activeTab: "employee" | "user";
  employeeForm: EmployeeForm;
  userForm: UserForm;
  employeeError: string;
  employeeMessage: string;
  userError: string;
  userMessage: string;
  isCreatingEmployee: boolean;
  isCreatingUser: boolean;
  onTabChange: (tab: "employee" | "user") => void;
  onEmployeeFieldChange: (field: keyof EmployeeForm, value: string) => void;
  onUserFieldChange: (field: keyof UserForm, value: string) => void;
  onCreateEmployee: (event: FormEvent<HTMLFormElement>) => void;
  onCreateUser: (event: FormEvent<HTMLFormElement>) => void;
};

const inputClass = "mt-2 w-full border-b border-[#cbbdaf] bg-transparent px-0 py-3 outline-none focus:border-[#c8754e]";

export function AdministrationPanel({ activeTab, employeeForm, userForm, employeeError, employeeMessage, userError, userMessage, isCreatingEmployee, isCreatingUser, onTabChange, onEmployeeFieldChange, onUserFieldChange, onCreateEmployee, onCreateUser }: AdministrationPanelProps) {
  return (
    <section className="py-8">
      <div className="border-b border-[#d9cec1] pb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#9b5b3b]">Administración</p>
        <h2 className="mt-2 font-serif text-4xl">Equipo y accesos</h2>
        <p className="mt-3 max-w-2xl text-[#75675d]">Gestiona los datos del equipo y crea las credenciales que usarán para ingresar al panel.</p>
      </div>
      <div className="mt-6 flex gap-2 border-b border-[#d9cec1]">
        <button type="button" onClick={() => onTabChange("employee")} className={`px-4 py-3 text-sm font-semibold ${activeTab === "employee" ? "border-b-2 border-[#c8754e]" : "text-[#75675d]"}`}>Nuevo empleado</button>
        <button type="button" onClick={() => onTabChange("user")} className={`px-4 py-3 text-sm font-semibold ${activeTab === "user" ? "border-b-2 border-[#c8754e]" : "text-[#75675d]"}`}>Nuevo usuario</button>
      </div>
      {activeTab === "employee" ? (
        <form onSubmit={onCreateEmployee} className="mt-8 grid gap-5 border border-[#d9cec1] bg-[#fffaf4] p-6 sm:grid-cols-2 lg:grid-cols-3">
          <label className="text-sm font-semibold">DNI<input required value={employeeForm.dni} onChange={(event) => onEmployeeFieldChange("dni", event.target.value)} className={inputClass} /></label>
          <label className="text-sm font-semibold">Nombre<input required value={employeeForm.name} onChange={(event) => onEmployeeFieldChange("name", event.target.value)} className={inputClass} /></label>
          <label className="text-sm font-semibold">Apellidos<input required value={employeeForm.last_name} onChange={(event) => onEmployeeFieldChange("last_name", event.target.value)} className={inputClass} /></label>
          <label className="text-sm font-semibold">Correo<input required type="email" value={employeeForm.email} onChange={(event) => onEmployeeFieldChange("email", event.target.value)} className={inputClass} /></label>
          <label className="text-sm font-semibold">Teléfono<input value={employeeForm.phone} onChange={(event) => onEmployeeFieldChange("phone", event.target.value)} className={inputClass} /></label>
          <label className="text-sm font-semibold">Dirección<input value={employeeForm.address} onChange={(event) => onEmployeeFieldChange("address", event.target.value)} className={inputClass} /></label>
          <label className="text-sm font-semibold">Fecha de ingreso<input required type="date" value={employeeForm.hire_date} onChange={(event) => onEmployeeFieldChange("hire_date", event.target.value)} className={inputClass} /></label>
          <div className="sm:col-span-2 lg:col-span-3">
            {employeeError && <p className="mb-3 text-sm text-[#9b3d32]">{employeeError}</p>}
            {employeeMessage && <p className="mb-3 text-sm text-[#47704b]">{employeeMessage}</p>}
            <button type="submit" disabled={isCreatingEmployee} className="bg-[#c8754e] px-5 py-3 text-sm font-semibold text-[#fffaf4] transition hover:bg-[#9b5b3b] disabled:cursor-not-allowed disabled:opacity-60">{isCreatingEmployee ? "Guardando..." : "Guardar empleado"}</button>
          </div>
        </form>
      ) : (
        <form onSubmit={onCreateUser} className="mt-8 max-w-2xl border border-[#d9cec1] bg-[#fffaf4] p-6">
          <p className="mb-6 text-sm text-[#75675d]">El DNI debe pertenecer a un empleado ya registrado.</p>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="text-sm font-semibold">DNI del empleado<input required value={userForm.dni} onChange={(event) => onUserFieldChange("dni", event.target.value)} className={inputClass} /></label>
            <label className="text-sm font-semibold">Nombre de usuario<input required autoComplete="username" value={userForm.username} onChange={(event) => onUserFieldChange("username", event.target.value)} className={inputClass} /></label>
            <label className="text-sm font-semibold">Contraseña<input required minLength={6} type="password" autoComplete="new-password" value={userForm.password} onChange={(event) => onUserFieldChange("password", event.target.value)} className={inputClass} /></label>
            <label className="text-sm font-semibold">Rol<select value={userForm.role} onChange={(event) => onUserFieldChange("role", event.target.value)} className={`${inputClass} py-3`}><option value="emp">Empleado</option><option value="adm">Administrador</option></select></label>
          </div>
          {userError && <p className="mt-5 text-sm text-[#9b3d32]">{userError}</p>}
          {userMessage && <p className="mt-5 text-sm text-[#47704b]">{userMessage}</p>}
          <button type="submit" disabled={isCreatingUser} className="mt-6 bg-[#c8754e] px-5 py-3 text-sm font-semibold text-[#fffaf4] transition hover:bg-[#9b5b3b] disabled:cursor-not-allowed disabled:opacity-60">{isCreatingUser ? "Guardando..." : "Guardar usuario"}</button>
        </form>
      )}
    </section>
  );
}

import type { AuthenticatedUser, PanelSection } from "./types";

type NavigationItem = {
  id: PanelSection;
  label: string;
  description: string;
};

type PanelNavigationProps = {
  user: AuthenticatedUser;
  activeSection: PanelSection;
  onSectionChange: (section: PanelSection) => void;
  onLogout: () => void;
};

const navigationItems: NavigationItem[] = [
  { id: "dashboard", label: "Resumen", description: "Vista general" },
  { id: "appointments", label: "Citas", description: "Agenda del día" },
  { id: "clients", label: "Clientes", description: "Directorio" },
  { id: "services", label: "Servicios", description: "Catálogo" },
  { id: "billing", label: "Facturación", description: "Comprobantes" },
];

export function PanelNavigation({ user, activeSection, onSectionChange, onLogout }: PanelNavigationProps) {
  const items = user.role === "adm" ? [...navigationItems, { id: "administration" as const, label: "Administración", description: "Equipo y accesos" }] : navigationItems;

  return (
    <>
      <aside className="hidden w-64 shrink-0 flex-col border border-[#d9cec1] bg-[#2c2520] p-5 text-[#fffaf4] lg:flex">
        <div className="border-b border-[#66564b] pb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#f2ad8e]">BarberHub</p>
          <p className="mt-2 text-sm text-[#d9cec1]">Gestión de barbería</p>
        </div>
        <nav className="mt-6 flex-1 space-y-2" aria-label="Navegación principal">
          {items.map((item) => (
            <button key={item.id} type="button" onClick={() => onSectionChange(item.id)} className={`w-full border-l-2 px-4 py-3 text-left transition ${activeSection === item.id || (item.id === "administration" && activeSection === "administration-users") ? "border-[#f2ad8e] bg-[#493b32]" : "border-transparent hover:bg-[#493b32]"}`}>
              <span className="block text-sm font-semibold">{item.label}</span>
              <span className="mt-1 block text-xs text-[#cbbdaf]">{item.description}</span>
            </button>
          ))}
        </nav>
        <div className="border-t border-[#66564b] pt-5">
          <p className="text-xs uppercase tracking-[0.16em] text-[#cbbdaf]">Sesión activa</p>
          <p className="mt-2 truncate text-sm font-semibold">{user.username}</p>
          <button type="button" onClick={onLogout} className="mt-4 text-sm font-semibold text-[#f2ad8e] hover:text-[#fffaf4]">Cerrar sesión</button>
        </div>
      </aside>
      <div className="mb-4 flex items-center gap-2 overflow-x-auto border border-[#d9cec1] bg-[#fffaf4] p-2 lg:hidden">
        {items.map((item) => (
          <button key={item.id} type="button" onClick={() => onSectionChange(item.id)} className={`whitespace-nowrap px-3 py-2 text-sm font-semibold ${activeSection === item.id || (item.id === "administration" && activeSection === "administration-users") ? "bg-[#2c2520] text-[#fffaf4]" : "text-[#75675d]"}`}>{item.label}</button>
        ))}
      </div>
    </>
  );
}

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

export function PanelNavigation({
  user,
  activeSection,
  onSectionChange,
  onLogout,
}: PanelNavigationProps) {
  const items =
    user.role === "adm"
      ? [
          ...navigationItems,
          {
            id: "administration" as const,
            label: "Administración",
            description: "Equipo y accesos",
          },
        ]
      : navigationItems;

  return (
    <>
      <aside className="panel-sidebar hidden w-64 shrink-0 flex-col border border-[#2d665b] p-5 text-[#f5faf7] lg:sticky lg:top-4 lg:flex lg:h-[calc(100vh-2rem)]">
        <div className="border-b border-[#376d62] pb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#efb07b]">
            AlvaBarber
          </p>
          <p className="mt-2 text-sm text-[#b7d0c8]">Gestión de barbería</p>
        </div>
        <nav
          className="mt-6 flex-1 space-y-2"
          aria-label="Navegación principal"
        >
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSectionChange(item.id)}
              className={`w-full border-l-2 px-4 py-3 text-left transition ${activeSection === item.id || (item.id === "administration" && activeSection === "administration-users") ? "border-[#f2ad8e] bg-[#493b32]" : "border-transparent hover:bg-[#493b32]"}`}
            >
              <span className="block text-sm font-semibold">{item.label}</span>
              <span className="mt-1 block text-xs text-[#b7d0c8]">
                {item.description}
              </span>
            </button>
          ))}
        </nav>
        <div className="border-t border-[#376d62] pt-5">
          <p className="text-xs uppercase tracking-[0.16em] text-[#b7d0c8]">
            Sesión activa
          </p>
          <p className="mt-2 truncate text-sm font-semibold">{user.username}</p>
          <button
            type="button"
            onClick={onLogout}
            className="mt-4 text-sm font-semibold text-[#f2ad8e] hover:text-[#fffaf4]"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>
      <div className="mobile-nav -mx-1 mb-1 flex w-[calc(100%+0.5rem)] items-center gap-2 overflow-x-auto border border-[#dce3dd] bg-white p-2 shadow-sm lg:hidden">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSectionChange(item.id)}
            className={`whitespace-nowrap px-3 py-2 text-sm font-semibold transition ${activeSection === item.id || (item.id === "administration" && activeSection === "administration-users") ? "bg-[#153e38] text-[#fffaf4]" : "text-[#65716b] hover:bg-[#eef3ef]"}`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </>
  );
}

import type { FormEvent } from "react";

type LoginScreenProps = {
  username: string;
  password: string;
  error: string;
  isSubmitting: boolean;
  onUsernameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function LoginScreen({ username, password, error, isSubmitting, onUsernameChange, onPasswordChange, onSubmit }: LoginScreenProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#2c2520] px-5 py-10 text-[#fffaf4]">
      <section className="grid w-full max-w-5xl overflow-hidden bg-[#fffaf4] text-[#2c2520] shadow-2xl lg:grid-cols-[0.9fr_1.1fr]">
        <div className="flex min-h-72 flex-col justify-between bg-[#c8754e] p-8 text-[#fffaf4] sm:p-12">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#f9d3be]">BarberHub</p>
            <h1 className="mt-16 font-serif text-5xl leading-none sm:text-6xl">Tu día empieza aquí.</h1>
          </div>
          <p className="mt-12 max-w-xs leading-7 text-[#f9e1d3]">Agenda, clientes y operación diaria en un solo lugar.</p>
        </div>
        <form onSubmit={onSubmit} className="p-8 sm:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#9b5b3b]">Acceso al panel</p>
          <h2 className="mt-3 font-serif text-4xl">Iniciar sesión</h2>
          <p className="mt-3 text-[#75675d]">Ingresa tus credenciales para continuar.</p>
          <div className="mt-10 space-y-5">
            <label className="block text-sm font-semibold">
              <span>Usuario</span>
              <input value={username} onChange={(event) => onUsernameChange(event.target.value)} className="mt-2 w-full border-b border-[#cbbdaf] bg-transparent px-0 py-3 outline-none transition focus:border-[#c8754e]" autoComplete="username" required />
            </label>
            <label className="block text-sm font-semibold">
              <span>Contraseña</span>
              <input type="password" value={password} onChange={(event) => onPasswordChange(event.target.value)} className="mt-2 w-full border-b border-[#cbbdaf] bg-transparent px-0 py-3 outline-none transition focus:border-[#c8754e]" autoComplete="current-password" required />
            </label>
          </div>
          {error && <p className="mt-5 text-sm text-[#9b3d32]">{error}</p>}
          <button type="submit" disabled={isSubmitting} className="mt-8 w-full bg-[#2c2520] px-5 py-4 text-sm font-semibold text-[#fffaf4] transition hover:bg-[#9b5b3b] disabled:cursor-not-allowed disabled:opacity-60">
            {isSubmitting ? "Ingresando..." : "Entrar al panel"}
          </button>
        </form>
      </section>
    </main>
  );
}

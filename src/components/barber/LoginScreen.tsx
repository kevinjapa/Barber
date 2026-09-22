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

export function LoginScreen({
  username,
  password,
  error,
  isSubmitting,
  onUsernameChange,
  onPasswordChange,
  onSubmit,
}: LoginScreenProps) {
  return (
    <main className="login-shell flex min-h-screen items-center justify-center px-5 py-10 text-[#f5faf7]">
      <section className="grid w-full max-w-5xl overflow-hidden border border-white/10 bg-white text-[#1f2925] shadow-2xl lg:grid-cols-[0.9fr_1.1fr]">
        <div className="login-brand flex min-h-72 flex-col justify-between p-8 text-[#fffaf4] sm:p-12">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#fff0df]">
              AlvaBarber
            </p>
            <h1 className="mt-16 font-serif text-5xl leading-none sm:text-6xl">
              Tu día empieza aquí.
            </h1>
          </div>
          <p className="mt-12 max-w-xs leading-7 text-[#fff0df]">
            Agenda, clientes y operación diaria en un solo lugar.
          </p>
        </div>
        <form onSubmit={onSubmit} className="p-8 sm:p-12">
          <p className="panel-kicker text-sm font-semibold uppercase">
            Acceso al panel
          </p>
          <h2 className="panel-title mt-3 font-serif text-4xl">
            Iniciar sesión
          </h2>
          <p className="mt-3 text-[#65716b]">
            Ingresa tus credenciales para continuar.
          </p>
          <div className="mt-10 space-y-5">
            <label className="block text-sm font-semibold">
              <span>Usuario</span>
              <input
                value={username}
                onChange={(event) => onUsernameChange(event.target.value)}
                className="mt-2 w-full border-b border-[#cfdad3] bg-transparent px-0 py-3 outline-none transition focus:border-[#1d5b4f]"
                autoComplete="username"
                required
              />
            </label>
            <label className="block text-sm font-semibold">
              <span>Contraseña</span>
              <input
                type="password"
                value={password}
                onChange={(event) => onPasswordChange(event.target.value)}
                className="mt-2 w-full border-b border-[#cfdad3] bg-transparent px-0 py-3 outline-none transition focus:border-[#1d5b4f]"
                autoComplete="current-password"
                required
              />
            </label>
          </div>
          {error && <p className="mt-5 text-sm text-[#a84f3d]">{error}</p>}
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-8 w-full bg-[#153e38] px-5 py-4 text-sm font-semibold text-[#fffaf4] transition hover:bg-[#1d5b4f] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Ingresando..." : "Entrar al panel"}
          </button>
        </form>
      </section>
    </main>
  );
}

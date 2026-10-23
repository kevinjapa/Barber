import type { FormEvent } from "react";
import { ThemeToggle } from "./ThemeToggle";

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
    <main className="login-shell relative flex min-h-screen items-center justify-center px-4 py-6 text-[#f5faf7] sm:px-6 sm:py-10">
      <div className="absolute right-4 top-4 sm:right-8 sm:top-8">
        <ThemeToggle />
      </div>
      <section className="login-card grid w-full max-w-5xl overflow-hidden lg:grid-cols-[0.95fr_1.05fr]">
        <div className="login-brand relative flex min-h-80 flex-col justify-between overflow-hidden p-7 text-[#f6f8f5] sm:p-12 lg:min-h-[600px]">
          <div className="login-brand-glow" />
          <div>
            <div className="flex items-center gap-3">
              {/* <span className="login-logo">A</span> */}
              <img
                src="/assets/alvaberber_icon.png"
                alt="AlvaBarber"
                className="booking-mark"
              />
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#dce9e0]">
                AlvaBarber ACADEMY
              </p>
            </div>
            <p className="login-eyebrow mt-20">Sistema de Administración</p>
            <h1 className="mt-4 max-w-sm font-serif text-5xl leading-[0.95] sm:text-6xl">
              Tu día empieza aquí.
            </h1>
          </div>
          <p className="relative mt-12 max-w-xs leading-7 text-[#c2d5ca]">
            Tu Sistema de Administracion de Barberia en un solo lugar. Gestiona tus citas, clientes y empleados de manera eficiente y segura.
          </p>
        </div>
        <form onSubmit={onSubmit} className="login-form p-7 sm:p-12 lg:p-16">
          <p className="login-eyebrow">Acceso seguro</p>
          <p className="panel-kicker mt-8 text-sm font-semibold uppercase">
            Acceso al panel
          </p>
          <h2 className="panel-title mt-3 font-serif text-4xl sm:text-5xl">
            Iniciar sesión
          </h2>
          <p className="login-muted mt-4 max-w-sm leading-6">
            Ingresa tus credenciales para continuar con la operación de tu
            barbería.
          </p>
          <div className="mt-10 space-y-6">
            <label className="login-label block text-sm font-semibold">
              <span>Usuario</span>
              <input
                value={username}
                onChange={(event) => onUsernameChange(event.target.value)}
                className="login-input mt-2 w-full px-4 py-3"
                autoComplete="username"
                required
              />
            </label>
            <label className="login-label block text-sm font-semibold">
              <span>Contraseña</span>
              <input
                type="password"
                value={password}
                onChange={(event) => onPasswordChange(event.target.value)}
                className="login-input mt-2 w-full px-4 py-3"
                autoComplete="current-password"
                required
              />
            </label>
          </div>
          {error && (
            <p role="alert" className="login-error mt-5 rounded-lg p-3 text-sm">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="login-submit mt-8 w-full px-5 py-4 text-sm font-semibold"
          >
            {isSubmitting ? "Ingresando..." : "Entrar al panel"}
          </button>
        </form>
      </section>
    </main>
  );
}

export const metadata = {
  title: "Aviso de privacidad | AlvaBarber",
  description: "Información sobre el uso y protección de datos personales.",
};

export default function PrivacyPage() {
  return (
    <main className="booking-shell min-h-screen px-5 py-10 sm:px-8">
      <article className="booking-card mx-auto max-w-3xl p-6 sm:p-10">
        <a href="/reservar" className="text-sm font-semibold text-[#1d5b4f]">
          ← Volver a reservas
        </a>
        <p className="booking-kicker mt-10">Transparencia</p>
        <h1 className="mt-3 font-serif text-4xl text-[#153e38]">
          Aviso de privacidad
        </h1>
        <p className="mt-4 text-sm leading-6 text-[#65716b]">
          Última actualización: 19 de octubre de 2026. Este aviso es
          informativo y debe ser revisado y ajustado por un profesional
          conforme a la normativa aplicable en Ecuador.
        </p>

        <div className="mt-8 space-y-7 text-sm leading-7 text-[#46554d]">
          <section>
            <h2 className="font-semibold text-[#153e38]">Responsable</h2>
            <p>
              El responsable informado para esta aplicación es Kevin Japa
              (AlvaBarber). Para consultas sobre datos personales escribe a{" "}
              <a className="font-semibold text-[#1d5b4f]" href="mailto:japakevin001@gmail.com">
                japakevin001@gmail.com
              </a>
              .
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-[#153e38]">Datos que recopilamos</h2>
            <p>
              Cédula o DNI, nombres, apellidos, correo electrónico, teléfono,
              fecha de cumpleaños cuando la proporciones y los datos de la
              cita solicitada. El DNI se usa para identificar clientes y evitar
              reservas duplicadas en un mismo día.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-[#153e38]">Finalidades</h2>
            <p>
              Gestionar y confirmar citas, mantener el registro del cliente,
              atender facturación y pagos, enviar comunicaciones relacionadas
              con la cita y, únicamente si lo autorizas por separado, enviar
              promociones o realizar análisis de mercado.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-[#153e38]">Conservación y derechos</h2>
            <p>
              Conservaremos la información durante el tiempo necesario para
              las finalidades informadas y obligaciones aplicables. Puedes
              solicitar acceso, corrección, actualización, eliminación o
              retirar autorizaciones escribiendo al correo de contacto.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-[#153e38]">Seguridad</h2>
            <p>
              La aplicación aplica controles de transporte y cabeceras web de
              seguridad, limita solicitudes públicas y restringe el acceso
              administrativo mediante autenticación. Ningún sistema conectado
              a internet puede garantizar seguridad absoluta; mantén tus datos
              de acceso bajo tu control.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}

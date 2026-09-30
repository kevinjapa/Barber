import smtplib
from email.message import EmailMessage
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class EmailSettings(BaseSettings):
    EMAIL_HOST: str
    EMAIL_PORT: int
    EMAIL_USER: str
    EMAIL_PASSWORD: str

    model_config = SettingsConfigDict(
        env_file=Path(__file__).resolve().parent.parent / ".env",
        env_prefix="",
        case_sensitive=True,
        extra="ignore",
    )


settings = EmailSettings()


def send_email(
    recipient: str,
    pdf_path: str,
    invoice_number: str
):
    msg = EmailMessage()

    msg["From"] = settings.EMAIL_USER
    msg["To"] = recipient
    msg["Subject"] = f"Comprobante de servicio #{invoice_number}"

    msg.set_content(
        f"""
Estimado cliente,

Adjuntamos el comprobante correspondiente al servicio realizado.

Comprobante N.º {invoice_number}

Gracias por su visita.

Nota: Este correo electrónico se ha enviado automáticamente.
Por favor, no responda a este mensaje.
"""
    )

    msg.add_alternative(
        f"""
        <html>
            <body>
                <h2>Comprobante de servicio</h2>

                <p>
                    Estimado cliente,
                </p>

                <p>
                    Adjuntamos el comprobante correspondiente
                    al servicio realizado.
                </p>

                <p>
                    <strong>Comprobante N.º {invoice_number}</strong>
                </p>

                <p>
                    Gracias por su visita.
                </p>

                <small>
                    Nota: Este correo electrónico se ha enviado automáticamente.
                    Por favor, no responda a este mensaje.
                </small>
            </body>
        </html>
        """,
        subtype="html"
    )

    # Adjuntar PDF
    with open(pdf_path, "rb") as file:
        pdf_content = file.read()

    msg.add_attachment(
        pdf_content,
        maintype="application",
        subtype="pdf",
        filename=f"comprobante_{invoice_number}.pdf"
    )

    # Conexión SMTP
    with smtplib.SMTP(
        settings.EMAIL_HOST,
        settings.EMAIL_PORT
    ) as smtp:

        smtp.starttls()

        smtp.login(
            settings.EMAIL_USER,
            settings.EMAIL_PASSWORD
        )

        smtp.send_message(msg)

    return {
        "message": "Correo enviado correctamente"
    }
from decimal import Decimal, ROUND_HALF_UP
from typing import Any

from .database import (
    find_product_price,
    find_service_price,
    get_connection,
    insert_invoice_detail,
    insert_invoice_header,
)


MONEY_QUANTUM = Decimal("0.01")
PAYMENT_METHOD_CODES = {
    "efectivo": "E",
    "cash": "E",
    "tarjeta": "T",
    "card": "T",
    "transferencia": "R",
    "transfer": "R",
}
INVOICE_STATUS_CODES = {
    "paid": "P",
    "pagada": "P",
    "pending": "D",
    "pendiente": "D",
    "cancelled": "C",
    "cancelada": "C",
}


def _money(value: Decimal) -> Decimal:
    return value.quantize(MONEY_QUANTUM, rounding=ROUND_HALF_UP)


def _get_code(value: str, codes: dict[str, str], field_name: str) -> str:
    normalized_value = value.strip().lower()
    if normalized_value in codes:
        return codes[normalized_value]
    if len(normalized_value) == 1:
        return normalized_value.upper()
    raise ValueError(f"{field_name} no válido: use un valor soportado")


def create_invoice(invoice: Any) -> dict[str, Any]:
    if not invoice.details:
        raise ValueError("La factura debe tener al menos un detalle")

    calculated_details: list[dict[str, Any]] = []
    invoice_total = Decimal("0")
    payment_method_code = _get_code(
        invoice.payment_method,
        PAYMENT_METHOD_CODES,
        "Método de pago",
    )
    status_code = _get_code(invoice.status, INVOICE_STATUS_CODES, "Estado de factura")

    with get_connection() as connection:
        for detail in invoice.details:
            if (detail.serviceid is None) == (detail.productid is None):
                raise ValueError("Cada detalle debe referenciar un servicio o un producto")

            if detail.quantity <= 0:
                raise ValueError("La cantidad debe ser mayor que cero")

            item = (
                find_service_price(connection, detail.serviceid)
                if detail.serviceid is not None
                else find_product_price(connection, detail.productid)
            )
            if item is None:
                item_type = "servicio" if detail.serviceid is not None else "producto"
                raise ValueError(f"El {item_type} indicado no existe o no está disponible")

            unit_price = _money(Decimal(str(item["price"])))
            detail_total = _money(unit_price * detail.quantity)
            invoice_total += detail_total
            calculated_details.append(
                {
                    "serviceid": detail.serviceid,
                    "productid": detail.productid,
                    "quantity": detail.quantity,
                    "unit_price": unit_price,
                    "total": detail_total,
                }
            )

        invoice_total = _money(invoice_total)
        invoice_id = insert_invoice_header(
            connection,
            invoice.code,
            payment_method_code,
            invoice_total,
            status_code,
            invoice.clientid,
            invoice.appoid,
        )

        for detail in calculated_details:
            insert_invoice_detail(connection, invoice_id, **detail)

    return {
        "inv_heaid": invoice_id,
        "code": invoice.code,
        "total": invoice_total,
        "details": calculated_details,
    }
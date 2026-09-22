from fastapi import FastAPI, HTTPException, status, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from typing import Optional
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from .billing_service import create_invoice as create_invoice_service
from .database import (
    deactivate_client,
    deactivate_employee,
    deactivate_person,
    deactivate_product,
    deactivate_service,
    find_client,
    find_employee,
    find_person,
    find_product,
    find_service,
    insert_appointment,
    list_active_appointments,
    list_active_employees,
    insert_appuser,
    insert_client,
    insert_emloyee,
    insert_product,
    insert_service,
    list_active_services,
    list_active_clients,
    list_invoices,
    find_invoice,
    list_all_services,
    list_products,
    update_client,
    update_employee,
    update_appointment,
    update_appointment_status,
    update_person,
    update_product,
    update_service,
    deactivate_appointment,
    login,
)

from .models import (encriptar_contraseña, upload_img, delete_img)

PERSON_NOT_FOUND = "Persona no encontrada"
EMPLOYEE_NOT_FOUND = "Empleado no encontrado"
CLIENT_NOT_FOUND = "Cliente no encontrado"

app= FastAPI()

class ServiceCreate(BaseModel):
    name: str
    duration: int
    price: float
    status: bool

class Service(ServiceCreate):
    serviceid: int
    img_url: Optional[str] = None


class ServiceUpdate(BaseModel):
    name: str = Field(min_length=1)
    duration: int = Field(gt=0)
    price: float = Field(ge=0)


class ProductCreate(BaseModel):
    name: str = Field(min_length=1)
    code: str = Field(min_length=1)
    stock: str
    price: float = Field(ge=0)
    # created_at: str
    # status: str = Field(min_length=1)
    description: str = ""
    img_url: UploadFile

class ProductUpdate(BaseModel):
    name: str = Field(min_length=1)
    code: str = Field(min_length=1)
    stock: str
    price: float = Field(ge=0)
    description: str = ""


class PersonUpdate(BaseModel):
    dni: str = Field(min_length=1)
    name: str = Field(min_length=1)
    last_name: str = Field(min_length=1)
    email: str = Field(min_length=1)
    address: str = ""
    phone: str = ""


class EmployeeUpdate(PersonUpdate):
    hire_date: str


class ClientUpdate(PersonUpdate):
    ruc: str = Field(min_length=1)


class InvoiceDetailCreate(BaseModel):
    serviceid: Optional[int] = Field(default=None, gt=0)
    productid: Optional[int] = Field(default=None, gt=0)
    quantity: int = Field(gt=0)


class InvoiceCreate(BaseModel):
    code: str = Field(min_length=1)
    payment_method: str = Field(min_length=1)
    status: str = Field(min_length=1)
    clientid: Optional[int] = Field(default=None, gt=0)
    appoid: Optional[int] = Field(default=None, gt=0)
    details: list[InvoiceDetailCreate] = Field(min_length=1)

app = FastAPI(title="Barber API", version="0.1.0")
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.add_middleware(
    CORSMiddleware,
    # allow_origins=["http://localhost:3000"],
    allow_origins=["http://*:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup() -> None:
    # initialize_database()
    pass


# @app.get("/api/health")
# def health_check() -> dict[str, str]:
#     return {"status": "ok", "service": "barber-api"}
# Servicios
@app.get("/api/services", response_model=list[Service])
def list_services():
    return list_active_services()


@app.get("/api/services/{serviceid}")
def get_service(serviceid: int):
    service = find_service(serviceid)
    if service is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Servicio no encontrado")
    return service

# Servicio
# @app.post("/api/services", status_code=status.HTTP_201_CREATED)
# def create_service(service: ServiceCreate) -> dict[str, str]:
#     insert_service(service.name, service.duration, service.price, service.status, service.img_url)
#     return {"status": "ok", "message": "Service created successfully"}

@app.post("/api/services", status_code=status.HTTP_201_CREATED)
def create_service(
    name: str = Form(...),
    duration: int = Form(...),
    price: float = Form(...),
    status: bool = Form(...),
    image: Optional[UploadFile] = File(None)) -> dict[str, str]:
    img_url = upload_img(image) if image else None
    try:
        insert_service(name,duration,price,status,img_url)
    except Exception as e:
        if img_url:
            delete_img(img_url)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    return {"status": "ok","message": "Service created successfully"}

@app.put("/api/services/{serviceid}")
def edit_service(
    serviceid: int,
    name: str = Form(...),
    duration: int = Form(...),
    price: float = Form(...),
    image: Optional[UploadFile] = File(None),
):
    current_service = find_service(serviceid)
    if current_service is None or not current_service["status"]:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Servicio no encontrado o inactivo")
    new_img_url = upload_img(image) if image else current_service.get("img_url")
    try:
        updated = update_service(serviceid, name, duration, price, new_img_url)
    except Exception as error:
        if image and new_img_url:
            delete_img(new_img_url)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(error)) from error
    if not updated:
        if image and new_img_url:
            delete_img(new_img_url)
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Servicio no encontrado o inactivo")
    if image and current_service.get("img_url") and current_service["img_url"] != new_img_url:
        delete_img(current_service["img_url"])
    return {"status": "ok", "message": "Servicio actualizado correctamente"}


@app.patch("/api/services/{serviceid}/status")
def disable_service(serviceid: int):
    service = find_service(serviceid)
    if service is None or not deactivate_service(serviceid):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Servicio no encontrado")
    if service.get("img_url"):
        delete_img(service["img_url"])
    return {"status": "ok", "message": "Servicio inactivado correctamente"}

@app.delete("/api/services/{serviceid}")
def delete_service(serviceid: int):
    return disable_service(serviceid)

# Producto
# @app.post("/api/products", status_code=status.HTTP_201_CREATED)
# def create_product(product: ProductCreate) -> dict[str, str]:
#     insert_product(product.name, product.code, product.stock, product.price, product.created_at, product.status, product.description)
#     return {"status": "ok", "message": "Product created successfully"}
@app.post("/api/products", status_code=status.HTTP_201_CREATED)
def create_product(
    name: str = Form(...),
    code: str = Form(...),
    stock: int = Form(...),
    price: float = Form(...),
    status: str = Form(...),
    description: str = Form(...),
    image: Optional[UploadFile] = File(None)) -> dict[str, str]:
    img_url = None
    if image:
        img_url = upload_img(image)
    try:
        insert_product(name,code,stock,price,status,description,img_url)
    except Exception as e:
        if img_url:
            delete_img(img_url)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    return {"status": "ok","message": "Product created successfully"}

@app.get("/api/products")
def get_products():
    return list_products()


@app.get("/api/products/{productid}")
def get_product(productid: int):
    product = find_product(productid)
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado")
    return product


@app.put("/api/products/{productid}")
def edit_product(productid: int, product: ProductUpdate):
    if not update_product(productid, product.name, product.code, product.stock, product.price, product.description):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado o inactivo")
    return {"status": "ok", "message": "Producto actualizado correctamente"}


@app.patch("/api/products/{productid}/status")
def disable_product(productid: int):
    if not deactivate_product(productid):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado")
    return {"status": "ok", "message": "Producto inactivado correctamente"}

# Empleado
@app.post("/api/employee", status_code=status.HTTP_201_CREATED)
def create_employee(employee: dict) -> dict[str, str]:
    insert_emloyee(employee["dni"], employee["name"], employee["last_name"], employee["email"], employee["address"], employee["phone"], employee["hire_date"])
    return {"status": "ok", "message": "Employee created successfully"}

# Cliente 
@app.post("/api/client", status_code=status.HTTP_201_CREATED)
def create_client(client: dict) -> dict[str, str]:
    insert_client(client["dni"], client["name"], client["last_name"], client["email"], client["address"], client["phone"], client["ruc"])
    return {"status": "ok", "message": "Client created successfully"}


@app.get("/api/clients")
def list_clients():
    return list_active_clients()


@app.get("/api/person/{personid}")
def get_person(personid: int):
    person = find_person(personid)
    if person is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=PERSON_NOT_FOUND)
    return person


@app.put("/api/person/{personid}")
def edit_person(personid: int, person: PersonUpdate):
    if not update_person(personid, **person.model_dump()):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=PERSON_NOT_FOUND)
    return {"status": "ok", "message": "Persona actualizada correctamente"}


@app.patch("/api/person/{personid}/status")
def disable_person(personid: int):
    if not deactivate_person(personid):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=PERSON_NOT_FOUND)
    return {"status": "ok", "message": "Persona inactivada correctamente"}


@app.get("/api/employee/{empid}")
def get_employee(empid: int):
    employee = find_employee(empid)
    if employee is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=EMPLOYEE_NOT_FOUND)
    return employee


@app.put("/api/employee/{empid}")
def edit_employee(empid: int, employee: EmployeeUpdate):
    if not update_employee(empid, **employee.model_dump()):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=EMPLOYEE_NOT_FOUND)
    return {"status": "ok", "message": "Empleado actualizado correctamente"}


@app.patch("/api/employee/{empid}/status")
def disable_employee(empid: int):
    if not deactivate_employee(empid):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=EMPLOYEE_NOT_FOUND)
    return {"status": "ok", "message": "Empleado inactivado correctamente"}


@app.get("/api/employees")
def get_employees():
    return list_active_employees()


@app.get("/api/client/{clientid}")
def get_client(clientid: int):
    client = find_client(clientid)
    if client is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=CLIENT_NOT_FOUND)
    return client


@app.put("/api/client/{clientid}")
def edit_client(clientid: int, client: ClientUpdate):
    if not update_client(clientid, **client.model_dump()):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=CLIENT_NOT_FOUND)
    return {"status": "ok", "message": "Cliente actualizado correctamente"}


@app.patch("/api/client/{clientid}/status")
def disable_client(clientid: int):
    if not deactivate_client(clientid):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=CLIENT_NOT_FOUND)
    return {"status": "ok", "message": "Cliente inactivado correctamente"}


@app.delete("/api/client/{clientid}")
def delete_client(clientid: int):
    return disable_client(clientid)

# Facturacion: cabecera y detalles en una sola transaccion
@app.post("/api/invoices", status_code=status.HTTP_201_CREATED)
def create_invoice(invoice: InvoiceCreate):
    try:
        return create_invoice_service(invoice)
    except ValueError as error:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(error)) from error


@app.get("/api/invoices")
def get_invoices():
    return list_invoices()


@app.get("/api/invoices/{inv_heaid}")
def get_invoice(inv_heaid: int):
    invoice = find_invoice(inv_heaid)
    if invoice is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Factura no encontrada")
    return invoice

# Citas
@app.get("/api/appointments")
def get_appointments():
    return list_active_appointments()


@app.post("/api/appointment", status_code=status.HTTP_201_CREATED)
def create_appointment(appointment: dict) -> dict[str, str]:
    insert_appointment(appointment["date"], appointment["start_time"], appointment["end_time"], appointment["description"], appointment["status"], appointment["empid"], appointment["clientid"])
    return {"status": "ok", "message": "Appointment created successfully"}


@app.put("/api/appointment/{appoid}")
def edit_appointment(appoid: int, appointment: dict):
    if not update_appointment(appoid, appointment["date"], appointment["start_time"], appointment["end_time"], appointment["description"], appointment["status"], appointment["empid"], appointment["clientid"]):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cita no encontrada")
    return {"status": "ok", "message": "Cita actualizada correctamente"}


@app.patch("/api/appointment/{appoid}/status")
def change_appointment_status(appoid: int, appointment: dict):
    appointment_status = appointment.get("status")
    if appointment_status not in {"P", "A", "F"}:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Estado de cita inválido")
    if not update_appointment_status(appoid, appointment_status):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="La cita no existe o ya está finalizada")
    return {"status": "ok", "message": "Estado de cita actualizado correctamente"}


@app.delete("/api/appointment/{appoid}")
def delete_appointment(appoid: int):
    if not deactivate_appointment(appoid):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cita no encontrada")
    return {"status": "ok", "message": "Cita cancelada correctamente"}

# usuario de la aplicacion
@app.post("/api/appuser", status_code=status.HTTP_201_CREATED)
def create_appuser(appuser: dict) -> dict[str, str]:
    hash_pass= encriptar_contraseña(appuser["password"])
    insert_appuser(appuser["username"], hash_pass, appuser["role"],appuser["dni"])
    return {"status": "ok", "message": "App user created successfully"}

# login
@app.post("/api/login")
def login_result(credentials: dict) -> dict[str, str]:
    very_pass = PasswordHasher()
    user = login(credentials["username"], credentials["password"])
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciales inválidas")
    try:
        very_pass.verify(user["password"],credentials["password"])
    except VerifyMismatchError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales inválidas"
        )
    return {
        "status": "ok","message": "Login successful","username": user["username"],"last_name": user["last_name"],"role": user["role"]
    }

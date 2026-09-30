from argon2 import PasswordHasher
from fastapi import UploadFile
from pathlib import Path
from uuid import uuid4

password_hasher = PasswordHasher()

UPLOAD_DIR = Path("uploads/services")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

def encriptar_contraseña(contraseña:str) -> str:
    return password_hasher.hash(contraseña)


def upload_img(image:UploadFile) -> str:
    if image:
        filename = Path(image.filename or "image").name
        unique_filename = f"{uuid4().hex}_{filename}"
        image_path = UPLOAD_DIR / unique_filename
        with open(image_path, "wb") as f:
            f.write(image.file.read())

        return str(image_path)
def delete_img(image_path:str) -> None:
    path = Path(image_path)
    if path.exists():
        path.unlink()
    
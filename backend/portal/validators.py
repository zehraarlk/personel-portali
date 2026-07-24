"""Ortak alan doğrulama kuralları (personel / yönetici CRUD)."""

from __future__ import annotations

import re
from datetime import date

from django.core.exceptions import ValidationError
from django.core.validators import validate_email as django_validate_email

NAME_RE = re.compile(r"^[A-Za-zÀ-ÿĞğÜüŞşİıÖöÇç\s'\-]+$")
SICIL_RE = re.compile(r"^[A-Za-z0-9._/\-]+$")
USERNAME_RE = re.compile(r"^[A-Za-z0-9._\-]{3,50}$")
EMAIL_LIKE_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def digits_only(value: str | None) -> str:
    return "".join(c for c in (value or "") if c.isdigit())


def is_valid_tc(tc: str) -> bool:
    """T.C. kimlik algoritması (11 hane + kontrol basamakları)."""
    if len(tc) != 11 or not tc.isdigit() or tc[0] == "0":
        return False
    d = [int(c) for c in tc]
    odd = d[0] + d[2] + d[4] + d[6] + d[8]
    even = d[1] + d[3] + d[5] + d[7]
    if ((odd * 7) - even) % 10 != d[9]:
        return False
    if sum(d[:10]) % 10 != d[10]:
        return False
    return True


def normalize_phone(value: str | None) -> str | None:
    """Boş → None; doluysa 05XXXXXXXXX biçimine getir."""
    raw = (value or "").strip()
    if not raw:
        return None
    phone = digits_only(raw)
    if len(phone) == 10 and phone.startswith("5"):
        phone = "0" + phone
    return phone


def is_valid_tr_mobile(phone: str) -> bool:
    return len(phone) == 11 and phone.startswith("05") and phone.isdigit()


def validate_person_name(value: str, field_label: str = "Ad") -> str:
    name = " ".join((value or "").split())
    if not name:
        raise ValidationError(f"{field_label} zorunludur.")
    if len(name) < 2:
        raise ValidationError(f"{field_label} en az 2 karakter olmalıdır.")
    if len(name) > 50:
        raise ValidationError(f"{field_label} en fazla 50 karakter olabilir.")
    if any(c.isdigit() for c in name):
        raise ValidationError(f"{field_label} rakam içeremez.")
    if not NAME_RE.match(name):
        raise ValidationError(f"{field_label} yalnızca harf içermelidir.")
    return name


def validate_email_address(value: str) -> str:
    email = (value or "").strip().lower()
    if not email:
        raise ValidationError("E-posta zorunludur.")
    if digits_only(email) == email.replace(" ", "") and "@" not in email:
        raise ValidationError("E-posta alanına telefon numarası girilemez.")
    try:
        django_validate_email(email)
    except ValidationError as exc:
        raise ValidationError("Geçerli bir e-posta adresi giriniz.") from exc
    if len(email) > 100:
        raise ValidationError("E-posta en fazla 100 karakter olabilir.")
    return email


def validate_tc_optional(value: str | None) -> str | None:
    raw = (value or "").strip()
    if not raw:
        return None
    tc = digits_only(raw)
    if not is_valid_tc(tc):
        raise ValidationError("Geçerli bir T.C. kimlik numarası giriniz.")
    return tc


def validate_phone_optional(value: str | None) -> str | None:
    raw = (value or "").strip()
    if not raw:
        return None
    if "@" in raw or EMAIL_LIKE_RE.match(raw):
        raise ValidationError("Telefon alanına e-posta girilemez.")
    phone = normalize_phone(raw)
    if not phone or not is_valid_tr_mobile(phone):
        raise ValidationError("Geçerli bir cep telefonu giriniz. Örn: 05XX XXX XX XX")
    return phone


def validate_sicil(value: str) -> str:
    sicil = (value or "").strip()
    if not sicil:
        raise ValidationError("Sicil no zorunludur.")
    if "@" in sicil or EMAIL_LIKE_RE.match(sicil):
        raise ValidationError("Sicil alanına e-posta girilemez.")
    if not SICIL_RE.match(sicil):
        raise ValidationError("Sicil no yalnızca harf, rakam ve . _ / - içerebilir.")
    if len(sicil) > 50:
        raise ValidationError("Sicil no en fazla 50 karakter olabilir.")
    return sicil


def validate_username(value: str) -> str:
    username = (value or "").strip()
    if not username:
        raise ValidationError("Kullanıcı adı zorunludur.")
    if "@" in username:
        raise ValidationError("Kullanıcı adına e-posta girilemez.")
    if " " in username:
        raise ValidationError("Kullanıcı adı boşluk içeremez.")
    if not USERNAME_RE.match(username):
        raise ValidationError(
            "Kullanıcı adı 3–50 karakter olmalı; yalnızca harf, rakam, . _ - kullanın."
        )
    return username


def validate_password(value: str | None, *, required: bool) -> str | None:
    raw = value or ""
    if not raw:
        if required:
            raise ValidationError("Şifre zorunludur.")
        return None
    if len(raw) < 6:
        raise ValidationError("Şifre en az 6 karakter olmalıdır.")
    if len(raw) > 128:
        raise ValidationError("Şifre en fazla 128 karakter olabilir.")
    return raw


def validate_birth_date(value) -> date:
    if value is None or value == "":
        raise ValidationError("Doğum tarihi zorunludur.")
    if isinstance(value, str):
        try:
            value = date.fromisoformat(value)
        except ValueError as exc:
            raise ValidationError("Geçerli bir doğum tarihi giriniz.") from exc
    today = date.today()
    if value > today:
        raise ValidationError("Doğum tarihi gelecekte olamaz.")
    if value.year < 1920:
        raise ValidationError("Doğum tarihi 1920’den önce olamaz.")
    age = today.year - value.year - (
        (today.month, today.day) < (value.month, value.day)
    )
    if age < 15:
        raise ValidationError("Personel en az 15 yaşında olmalıdır.")
    if age > 90:
        raise ValidationError("Doğum tarihi geçersiz görünüyor.")
    return value

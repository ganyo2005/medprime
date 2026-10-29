"""Ports netlify/functions/certificate.ts — id format, QR code, issuance rule."""

import io
import secrets

import qrcode
import qrcode.image.svg

ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"


def new_id() -> str:
    s = "".join(secrets.choice(ALPHABET) for _ in range(8))
    return f"MP-{s[:4]}-{s[4:]}"


def qr_svg(url: str) -> str:
    img = qrcode.make(url, image_factory=qrcode.image.svg.SvgPathImage)
    buf = io.BytesIO()
    img.save(buf)
    return buf.getvalue().decode()

# Entry point cPanel's "Setup Python App" (Phusion Passenger) imports directly.
# Passenger looks for a module-level `application` callable — just hand it Django's.
from config.wsgi import application  # noqa: F401

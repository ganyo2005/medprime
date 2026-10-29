from pathlib import Path

from django.conf import settings
from django.http import HttpResponse


def service_worker(request):
    content = (Path(settings.BASE_DIR) / "sw.js").read_text(encoding="utf-8")
    content = content.replace("/__ADMIN_URL__", "/" + settings.ADMIN_URL.rstrip("/"))
    return HttpResponse(content, content_type="application/javascript", headers={"Cache-Control": "no-cache"})


def robots_txt(request):
    # Deliberately does not mention the real admin path — publishing it in a
    # world-readable robots.txt would hand bots exactly what obscuring it was for.
    return HttpResponse(
        "User-agent: *\nDisallow: /api/\nDisallow: /_allauth/\nDisallow: /accounts/\n",
        content_type="text/plain",
    )

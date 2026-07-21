from django.conf import settings
from django.db import connection
from rest_framework.decorators import api_view
from rest_framework.response import Response


@api_view(["GET"])
def health(request):
    return Response({"status": "ok"})


@api_view(["GET"])
def system_status(request):
    db_ok = False
    db_error = None
    version = None
    engine = connection.vendor

    try:
        with connection.cursor() as cursor:
            if engine == "sqlite":
                cursor.execute("SELECT sqlite_version()")
                version = f"SQLite {cursor.fetchone()[0]}"
            else:
                cursor.execute("SELECT version()")
                version = cursor.fetchone()[0]
        db_ok = True
    except Exception as exc:
        db_error = str(exc)

    db_name = settings.DATABASES["default"].get("NAME")
    if hasattr(db_name, "name"):
        db_name = db_name.name

    return Response(
        {
            "status": "ok",
            "database": {
                "connected": db_ok,
                "engine": engine,
                "name": str(db_name),
                "version": version,
                "error": db_error,
            },
            "stack": {
                "backend": "Django",
                "frontend": "React",
                "database": "SQLite" if engine == "sqlite" else "PostgreSQL",
            },
        }
    )

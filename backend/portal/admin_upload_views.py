"""Admin görsel yükleme — frontend/public/images/uploads."""
import re
import uuid
from pathlib import Path

from django.conf import settings
from rest_framework.decorators import api_view, authentication_classes, permission_classes, parser_classes
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status

ALLOWED_EXT = {'.jpg', '.jpeg', '.png', '.webp', '.gif'}
MAX_BYTES = 8 * 1024 * 1024  # 8 MB


def _uploads_dir() -> Path:
    # backend/ → proje kökü → frontend/public/images/uploads
    root = Path(settings.BASE_DIR).resolve().parent
    dest = root / 'frontend' / 'public' / 'images' / 'uploads'
    dest.mkdir(parents=True, exist_ok=True)
    return dest


def _safe_stem(name: str) -> str:
    stem = Path(name).stem
    cleaned = re.sub(r'[^\w\-]+', '-', stem, flags=re.UNICODE).strip('-').lower()
    return (cleaned[:60] or 'gorsel')


@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
@parser_classes([MultiPartParser, FormParser])
def admin_upload_image(request):
    upload = request.FILES.get('file') or request.FILES.get('resim')
    if not upload:
        return Response({'detail': 'Dosya seçilmedi.'}, status=status.HTTP_400_BAD_REQUEST)

    if upload.size and upload.size > MAX_BYTES:
        return Response({'detail': 'Dosya en fazla 8 MB olabilir.'}, status=status.HTTP_400_BAD_REQUEST)

    ext = Path(upload.name).suffix.lower()
    if ext not in ALLOWED_EXT:
        return Response(
            {'detail': 'İzin verilen türler: jpg, jpeg, png, webp, gif.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    filename = f'{_safe_stem(upload.name)}_{uuid.uuid4().hex[:8]}{ext}'
    dest = _uploads_dir() / filename
    with dest.open('wb') as out:
        for chunk in upload.chunks():
            out.write(chunk)

    # Mevcut kayıt formatı ile uyumlu
    path = f'../images/uploads/{filename}'
    return Response({'path': path, 'url': f'/images/uploads/{filename}'})

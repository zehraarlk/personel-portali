"""Admin dosya yükleme — proje kökü images/uploads (görsel + belge)."""
import re
import uuid
from pathlib import Path

from django.conf import settings
from rest_framework.decorators import api_view, authentication_classes, permission_classes, parser_classes
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status

ALLOWED_IMAGE_EXT = {'.jpg', '.jpeg', '.png', '.webp', '.gif'}
ALLOWED_DOC_EXT = {'.pdf', '.doc', '.docx', '.xls', '.xlsx'}
ALLOWED_EXT = ALLOWED_IMAGE_EXT | ALLOWED_DOC_EXT
MAX_IMAGE_BYTES = 8 * 1024 * 1024  # 8 MB
MAX_DOC_BYTES = 25 * 1024 * 1024  # 25 MB


def _project_root() -> Path:
    return Path(settings.BASE_DIR).resolve().parent


def _uploads_dir() -> Path:
    """Tek kaynak: <repo>/images/uploads"""
    dest = _project_root() / 'images' / 'uploads'
    dest.mkdir(parents=True, exist_ok=True)
    return dest


def _safe_stem(name: str) -> str:
    stem = Path(name).stem
    cleaned = re.sub(r'[^\w\-]+', '-', stem, flags=re.UNICODE).strip('-').lower()
    return (cleaned[:60] or 'dosya')


def _format_size(num_bytes):
    if not num_bytes or num_bytes < 0:
        return ''
    if num_bytes < 1024:
        return f'{num_bytes} B'
    if num_bytes < 1024 * 1024:
        return f'{max(1, round(num_bytes / 1024))} KB'
    mb = num_bytes / (1024 * 1024)
    text = f'{mb:.1f} MB'
    return text.replace('.0 MB', ' MB')


@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
@parser_classes([MultiPartParser, FormParser])
def admin_upload_image(request):
    upload = request.FILES.get('file') or request.FILES.get('resim') or request.FILES.get('pdf')
    if not upload:
        return Response({'detail': 'Dosya seçilmedi.'}, status=status.HTTP_400_BAD_REQUEST)

    ext = Path(upload.name).suffix.lower()
    if ext not in ALLOWED_EXT:
        return Response(
            {
                'detail': (
                    'İzin verilen türler: jpg, jpeg, png, webp, gif, '
                    'pdf, doc, docx, xls, xlsx.'
                ),
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    max_bytes = MAX_DOC_BYTES if ext in ALLOWED_DOC_EXT else MAX_IMAGE_BYTES
    if upload.size and upload.size > max_bytes:
        limit_mb = max_bytes // (1024 * 1024)
        return Response(
            {'detail': f'Dosya en fazla {limit_mb} MB olabilir.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    filename = f'{_safe_stem(upload.name)}_{uuid.uuid4().hex[:8]}{ext}'
    dest = _uploads_dir() / filename
    with dest.open('wb') as out:
        for chunk in upload.chunks():
            out.write(chunk)

    path = f'../images/uploads/{filename}'
    url = f'/images/uploads/{filename}'
    return Response({
        'path': path,
        'url': url,
        'size': upload.size or 0,
        'size_label': _format_size(upload.size),
        'filename': upload.name,
        'ext': ext,
    })

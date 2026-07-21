from datetime import date

from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Haber, Duyuru, Personel, AnasayfaLink
from .serializers import (
    HaberSerializer,
    DuyuruSerializer,
    BirthdaySerializer,
    AnasayfaLinkSerializer,
)


@api_view(['GET'])
def home_dashboard(request):
    """Eski ana_sayfa.php mantığı: haberler, duyurular, doğum günleri, otomasyon."""
    today = date.today()
    birthdays = Personel.objects.filter(
        dogum_tarihi__month=today.month,
        dogum_tarihi__day=today.day,
    )

    return Response(
        {
            'haberler': HaberSerializer(Haber.objects.all(), many=True).data,
            'duyurular': DuyuruSerializer(Duyuru.objects.all(), many=True).data,
            'dogum_gunleri': BirthdaySerializer(birthdays, many=True).data,
            'otomasyon': AnasayfaLinkSerializer(AnasayfaLink.objects.all(), many=True).data,
            'tarih': today.isoformat(),
            'tarih_tr': today.strftime('%d.%m.%Y'),
        }
    )

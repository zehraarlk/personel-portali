from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    home_dashboard,
    site_icons,
    sizden_gelenler_list,
    sizden_gelenler_goruntule,
    videos,
    etkinlikler_list,
    etkinlik_duyurular_list,
    protokoller_list,
    egitimler_list,
    dokumanlar_list,
    mevzuatlar_list,
    vefat_list,
)
from .profile_views import (
    profile_me,
    profile_sessions,
    profile_change_email,
    profile_change_password,
)
from .admin_profile_views import (
    admin_profile_me,
    admin_profile_sessions,
    admin_profile_change_password,
)
from .admin_dashboard_views import admin_dashboard
from .admin_upload_views import admin_upload_image
from .auth_views import (
    auth_login,
    auth_admin_login,
    auth_forgot_password,
    auth_session_check,
    auth_session_resume,
    auth_logout,
    auth_admin_logout,
)
from .admin_crud_views import (
    EtkinlikViewSet,
    EtkinlikDuyuruViewSet,
    PersonelViewSet,
    YoneticiViewSet,
    VideoViewSet,
    SizdenGelenViewSet,
    VideoKategoriViewSet,
    SizdenGelenKategoriViewSet,
    ProtokolViewSet,
    DokumanlarViewSet,
    MevzuatlarViewSet,
    EgitimlerViewSet,
    AnketViewSet,
    AnketKategoriViewSet,
    YardimciLinkViewSet,
    YardimciLinkKategoriViewSet,
    VefatViewSet,
    DogumGunuViewSet,
)
from .anket_views import (
    anketler_list,
    anket_detay,
    anket_katil,
)
from .yardimci_linkler_views import yardimci_linkler_list

router = DefaultRouter()
router.register(r'admin/etkinlikler', EtkinlikViewSet, basename='admin-etkinlikler')
router.register(r'admin/duyurular', EtkinlikDuyuruViewSet, basename='admin-duyurular')
router.register(r'admin/personeller', PersonelViewSet, basename='admin-personeller')
router.register(r'admin/yoneticiler', YoneticiViewSet, basename='admin-yoneticiler')
router.register(r'admin/videolar', VideoViewSet, basename='admin-videolar')
router.register(r'admin/sizden-gelenler', SizdenGelenViewSet, basename='admin-sizden-gelenler')
router.register(
    r'admin/videolar-kategoriler', VideoKategoriViewSet, basename='admin-videolar-kategoriler'
)
router.register(
    r'admin/sizden-gelenler-kategoriler',
    SizdenGelenKategoriViewSet,
    basename='admin-sizden-gelenler-kategoriler',
)
router.register(r'admin/protokoller', ProtokolViewSet, basename='admin-protokoller')
router.register(r'admin/dokumanlar', DokumanlarViewSet, basename='admin-dokumanlar')
router.register(r'admin/mevzuatlar', MevzuatlarViewSet, basename='admin-mevzuatlar')
router.register(r'admin/egitimler', EgitimlerViewSet, basename='admin-egitimler')
router.register(r'admin/anketler', AnketViewSet, basename='admin-anketler')
router.register(
    r'admin/anketler-kategoriler',
    AnketKategoriViewSet,
    basename='admin-anketler-kategoriler',
)
router.register(r'admin/yardimci-linkler', YardimciLinkViewSet, basename='admin-yardimci-linkler')
router.register(
    r'admin/yardimci-linkler-kategoriler',
    YardimciLinkKategoriViewSet,
    basename='admin-yardimci-linkler-kategoriler',
)
router.register(r'admin/vefat', VefatViewSet, basename='admin-vefat')
router.register(r'admin/dogum-gunu', DogumGunuViewSet, basename='admin-dogum-gunu')

urlpatterns = [
    path('home/', home_dashboard, name='home-dashboard'),
    path('icons/', site_icons, name='site-icons'),
    path('videos/', videos, name='videos'),

    path('auth/login/', auth_login, name='auth-login'),
    path('auth/admin-login/', auth_admin_login, name='auth-admin-login'),
    path('auth/forgot-password/', auth_forgot_password, name='auth-forgot-password'),
    path('auth/logout/', auth_logout, name='auth-logout'),
    path('auth/admin-logout/', auth_admin_logout, name='auth-admin-logout'),
    path('auth/session-check/', auth_session_check, name='auth-session-check'),
    path('auth/session-resume/', auth_session_resume, name='auth-session-resume'),

    path('profile/', profile_me, name='profile-me'),
    path('profile/sessions/', profile_sessions, name='profile-sessions'),
    path('profile/change-email/', profile_change_email, name='profile-change-email'),
    path('profile/change-password/', profile_change_password, name='profile-change-password'),
    path('sizden-gelenler/', sizden_gelenler_list, name='sizden-gelenler'),
    path(
        'sizden-gelenler/<int:pk>/goruntule/',
        sizden_gelenler_goruntule,
        name='sizden-gelenler-goruntule',
    ),
    path('etkinlikler/', etkinlikler_list, name='etkinlikler'),
    path('duyurular/', etkinlik_duyurular_list, name='etkinlik-duyurular'),
    path('protokoller/', protokoller_list, name='protokoller'),
    path('egitimler/', egitimler_list, name='egitimler'),
    path('dokumanlar/', dokumanlar_list, name='dokumanlar'),
    path('mevzuatlar/', mevzuatlar_list, name='mevzuatlar'),
    path('vefat/', vefat_list, name='vefat'),
    path('anketler/', anketler_list, name='anketler'),
    path('anketler/<int:pk>/', anket_detay, name='anket-detay'),
    path('anketler/<int:pk>/katil/', anket_katil, name='anket-katil'),
    path('yardimci-linkler/', yardimci_linkler_list, name='yardimci-linkler'),

    path('admin/profile/', admin_profile_me, name='admin-profile-me'),
    path('admin/profile/sessions/', admin_profile_sessions, name='admin-profile-sessions'),
    path(
        'admin/profile/change-password/',
        admin_profile_change_password,
        name='admin-profile-change-password',
    ),
    path('admin/dashboard/', admin_dashboard, name='admin-dashboard'),
    path('admin/upload/', admin_upload_image, name='admin-upload'),
    path('', include(router.urls)),
]

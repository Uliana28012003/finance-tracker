from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TransactionViewSet, register

router = DefaultRouter()
router.register(r'transactions', TransactionViewSet, basename='transaction')

urlpatterns = [
    path('', include(router.urls)),
    path('register/', register, name='register'),  # ✅ маршрут для регистрации
]

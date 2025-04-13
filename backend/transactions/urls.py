from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TransactionViewSet, register, CategoryViewSet

router = DefaultRouter()
router.register(r'transactions', TransactionViewSet, basename='transaction')
router.register(r'categories', CategoryViewSet, basename='category')

urlpatterns = [
    path('', include(router.urls)),
    path('register/', register, name='register'),  # ✅ маршрут для регистрации
]

from rest_framework import serializers
from .models import Transaction, Category

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']

class TransactionSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)  # Отображение категории в ответе
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), write_only=True, source='category'  # Приём ID категории при создании
    )

    class Meta:
        model = Transaction
        fields = ['id', 'category', 'category_id', 'amount', 'type', 'description', 'date', 'user']
        read_only_fields = ['user']

from rest_framework import serializers
from .models import Order, OrderItem
from accounts.serializers import UserSerializer


class OrderItemSerializer(serializers.ModelSerializer):
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'vendor', 'quantity', 'unit_price', 'subtotal']
        read_only_fields = ['id', 'product_name', 'vendor']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    customer_detail = UserSerializer(source='customer', read_only=True)
    delivery_partner_detail = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'order_id', 'customer', 'customer_detail',
            'delivery_address', 'campus_zone', 'status', 'status_display',
            'total_price', 'delivery_partner', 'delivery_partner_detail',
            'special_instructions', 'is_paid', 'items', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'order_id', 'customer', 'total_price',
            'is_paid', 'created_at', 'updated_at'
        ]

    def get_delivery_partner_detail(self, obj):
        if obj.delivery_partner:
            return {
                'id': obj.delivery_partner.id,
                'name': obj.delivery_partner.get_full_name() or obj.delivery_partner.username,
                'phone': obj.delivery_partner.phone_number,
            }
        return None


class PlaceOrderSerializer(serializers.Serializer):
    delivery_address = serializers.CharField(max_length=500)
    special_instructions = serializers.CharField(required=False, allow_blank=True)

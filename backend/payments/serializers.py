from rest_framework import serializers
from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['id', 'order', 'razorpay_order_id', 'razorpay_payment_id',
                  'amount', 'status', 'created_at']
        read_only_fields = ['id', 'razorpay_order_id', 'razorpay_payment_id',
                            'amount', 'status', 'created_at']


class CreatePaymentSerializer(serializers.Serializer):
    order_id = serializers.CharField(max_length=20)


class VerifyPaymentSerializer(serializers.Serializer):
    razorpay_order_id = serializers.CharField()
    razorpay_payment_id = serializers.CharField()
    razorpay_signature = serializers.CharField()

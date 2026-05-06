from rest_framework import serializers
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'title', 'message', 'event_type', 'is_read',
                  'related_order_id', 'created_at']
        read_only_fields = ['id', 'title', 'message', 'event_type',
                            'related_order_id', 'created_at']

from rest_framework import serializers
from .models import CampusZone


class CampusZoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = CampusZone
        fields = ['id', 'name', 'zone_type', 'address_keywords', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']


class AddressValidationSerializer(serializers.Serializer):
    address = serializers.CharField(max_length=500)

from rest_framework import serializers
from .models import VendorProfile
from accounts.serializers import UserSerializer


class VendorProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    logo_url = serializers.SerializerMethodField()

    class Meta:
        model = VendorProfile
        fields = ['id', 'user', 'shop_name', 'description', 'logo', 'logo_url',
                  'is_approved', 'address', 'created_at']
        read_only_fields = ['id', 'is_approved', 'created_at', 'user']

    def get_logo_url(self, obj):
        request = self.context.get('request')
        if obj.logo and request:
            return request.build_absolute_uri(obj.logo.url)
        return None


class VendorPublicSerializer(serializers.ModelSerializer):
    logo_url = serializers.SerializerMethodField()
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = VendorProfile
        fields = ['id', 'shop_name', 'description', 'logo_url', 'address', 'username']

    def get_logo_url(self, obj):
        request = self.context.get('request')
        if obj.logo and request:
            return request.build_absolute_uri(obj.logo.url)
        return None

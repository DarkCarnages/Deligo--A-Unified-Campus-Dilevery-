from rest_framework import serializers
from django.contrib.auth import get_user_model
from vendors.models import VendorProfile

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    password2 = serializers.CharField(write_only=True, label='Confirm Password')
    shop_name = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name',
                  'password', 'password2', 'role', 'phone_number', 'shop_name']
        extra_kwargs = {
            'email': {'required': True},
            'first_name': {'required': True},
            'last_name': {'required': True},
        }

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({'password': 'Passwords do not match.'})
        if data.get('role') == 'VENDOR' and not data.get('shop_name'):
            raise serializers.ValidationError({'shop_name': 'Shop name is required for vendors.'})
        return data

    def create(self, validated_data):
        shop_name = validated_data.pop('shop_name', '')
        validated_data.pop('password2')
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        if user.role == 'VENDOR':
            VendorProfile.objects.create(user=user, shop_name=shop_name)
        return user


class UserSerializer(serializers.ModelSerializer):
    vendor_profile = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name',
                  'role', 'phone_number', 'profile_picture', 'vendor_profile', 'created_at',"is_active"]
        read_only_fields = ['id', 'created_at', 'role']

    def get_vendor_profile(self, obj):
        if obj.role == 'VENDOR':
            try:
                vp = obj.vendor_profile
                return {
                    'id': vp.id,
                    'shop_name': vp.shop_name,
                    'description': vp.description,
                    'is_approved': vp.is_approved,
                    'logo': self.context['request'].build_absolute_uri(vp.logo.url) if vp.logo else None,
                }
            except Exception:
                return None
        return None


class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'phone_number', 'profile_picture']

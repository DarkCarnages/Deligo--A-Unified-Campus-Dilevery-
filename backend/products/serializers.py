from rest_framework import serializers
from .models import Product, Category, SubCategory, Review
from vendors.serializers import VendorPublicSerializer


class SubCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = SubCategory
        fields = ['id', 'name', 'slug', 'category']


class CategorySerializer(serializers.ModelSerializer):
    subcategories = SubCategorySerializer(many=True, read_only=True)

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'icon', 'subcategories']


class ProductSerializer(serializers.ModelSerializer):
    vendor_detail = VendorPublicSerializer(source='vendor', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    subcategory_name = serializers.CharField(source='subcategory.name', read_only=True)
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'description', 'price', 'image', 'image_url',
            'category', 'category_name', 'subcategory', 'subcategory_name',
            'vendor', 'vendor_detail', 'is_available', 'avg_rating',
            'total_ratings', 'created_at'
        ]
        read_only_fields = ['id', 'avg_rating', 'total_ratings', 'created_at', 'vendor']

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None

    def create(self, validated_data):
        vendor = self.context['request'].user.vendor_profile
        return Product.objects.create(vendor=vendor, **validated_data)


class ReviewSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.get_full_name', read_only=True)
    customer_username = serializers.CharField(source='customer.username', read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'product', 'customer', 'customer_name', 'customer_username',
                  'order', 'rating', 'comment', 'created_at']
        read_only_fields = ['id', 'customer', 'created_at']

    def validate(self, data):
        from orders.models import Order
        order = data.get('order')
        customer = self.context['request'].user
        if order.customer != customer:
            raise serializers.ValidationError("You can only review your own orders.")
        if order.status != 'DELIVERED':
            raise serializers.ValidationError("You can only review after the order is delivered.")
        product = data.get('product')
        if Review.objects.filter(product=product, customer=customer, order=order).exists():
            raise serializers.ValidationError("You have already reviewed this product for this order.")
        # Verify product is in the order
        if not order.items.filter(product=product).exists():
            raise serializers.ValidationError("This product is not in the selected order.")
        return data

    def create(self, validated_data):
        validated_data['customer'] = self.context['request'].user
        review = super().create(validated_data)
        review.product.update_rating()
        return review

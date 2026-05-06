from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from django.db.models import Q
from .models import Product, Category, SubCategory, Review
from .serializers import ProductSerializer, CategorySerializer, ReviewSerializer
from vendors.models import VendorProfile


class CategoryListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        categories = Category.objects.prefetch_related('subcategories').all()
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)


class ProductListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        products = Product.objects.filter(is_available=True).select_related(
            'vendor', 'category', 'subcategory'
        )
        # Filters
        category = request.query_params.get('category')
        subcategory = request.query_params.get('subcategory')
        vendor = request.query_params.get('vendor')
        min_price = request.query_params.get('min_price')
        max_price = request.query_params.get('max_price')
        search = request.query_params.get('search')

        if category:
            products = products.filter(category__slug=category)
        if subcategory:
            products = products.filter(subcategory__slug=subcategory)
        if vendor:
            products = products.filter(vendor__id=vendor)
        if min_price:
            products = products.filter(price__gte=min_price)
        if max_price:
            products = products.filter(price__lte=max_price)
        if search:
            products = products.filter(
                Q(name__icontains=search) |
                Q(description__icontains=search) |
                Q(vendor__shop_name__icontains=search)
            )

        serializer = ProductSerializer(products, many=True, context={'request': request})
        return Response(serializer.data)

    def post(self, request):
        if not request.user.is_authenticated or request.user.role != 'VENDOR':
            return Response({'error': 'Vendor access required'}, status=403)
        try:
            if not request.user.vendor_profile.is_approved:
                return Response({'error': 'Your vendor account is not yet approved.'}, status=403)
        except Exception:
            return Response({'error': 'Vendor profile not found.'}, status=404)

        serializer = ProductSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


class ProductDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, product_id):
        try:
            product = Product.objects.select_related('vendor', 'category', 'subcategory').get(id=product_id)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found'}, status=404)
        serializer = ProductSerializer(product, context={'request': request})
        return Response(serializer.data)

    def put(self, request, product_id):
        if not request.user.is_authenticated or request.user.role != 'VENDOR':
            return Response({'error': 'Vendor access required'}, status=403)
        try:
            product = Product.objects.get(id=product_id, vendor=request.user.vendor_profile)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found or not yours'}, status=404)
        serializer = ProductSerializer(product, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def delete(self, request, product_id):
        if not request.user.is_authenticated or request.user.role != 'VENDOR':
            return Response({'error': 'Vendor access required'}, status=403)
        try:
            product = Product.objects.get(id=product_id, vendor=request.user.vendor_profile)
            product.delete()
            return Response({'message': 'Product deleted'})
        except Product.DoesNotExist:
            return Response({'error': 'Product not found or not yours'}, status=404)


class VendorProductListView(APIView):
    """Vendor: list own products."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'VENDOR':
            return Response({'error': 'Vendor access required'}, status=403)
        try:
            products = Product.objects.filter(vendor=request.user.vendor_profile)
            serializer = ProductSerializer(products, many=True, context={'request': request})
            return Response(serializer.data)
        except Exception:
            return Response([])


class ReviewListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, product_id):
        reviews = Review.objects.filter(product__id=product_id).order_by('-created_at')
        serializer = ReviewSerializer(reviews, many=True)
        return Response(serializer.data)


class ReviewCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.role != 'CUSTOMER':
            return Response({'error': 'Only customers can leave reviews.'}, status=403)
        serializer = ReviewSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

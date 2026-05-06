from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Cart, CartItem
from .serializers import CartSerializer, CartItemSerializer
from products.models import Product


class CartView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        cart, _ = Cart.objects.get_or_create(customer=request.user)
        serializer = CartSerializer(cart, context={'request': request})
        return Response(serializer.data)

    def delete(self, request):
        """Clear entire cart."""
        try:
            cart = Cart.objects.get(customer=request.user)
            cart.items.all().delete()
        except Cart.DoesNotExist:
            pass
        return Response({'message': 'Cart cleared.'})


class CartItemView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Add item to cart or update quantity if exists."""
        product_id = request.data.get('product')
        quantity = int(request.data.get('quantity', 1))

        try:
            product = Product.objects.get(id=product_id, is_available=True)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found or unavailable.'}, status=404)

        cart, _ = Cart.objects.get_or_create(customer=request.user)
        item, created = CartItem.objects.get_or_create(cart=cart, product=product)
        if not created:
            item.quantity += quantity
        else:
            item.quantity = quantity
        item.save()

        serializer = CartSerializer(cart, context={'request': request})
        return Response(serializer.data, status=201 if created else 200)

    def put(self, request, item_id):
        """Update quantity of a cart item."""
        try:
            item = CartItem.objects.get(id=item_id, cart__customer=request.user)
        except CartItem.DoesNotExist:
            return Response({'error': 'Cart item not found.'}, status=404)

        quantity = int(request.data.get('quantity', 1))
        if quantity < 1:
            item.delete()
            cart = Cart.objects.get(customer=request.user)
            return Response(CartSerializer(cart, context={'request': request}).data)

        item.quantity = quantity
        item.save()
        cart = Cart.objects.get(customer=request.user)
        return Response(CartSerializer(cart, context={'request': request}).data)

    def delete(self, request, item_id):
        """Remove specific item from cart."""
        try:
            item = CartItem.objects.get(id=item_id, cart__customer=request.user)
            item.delete()
        except CartItem.DoesNotExist:
            return Response({'error': 'Item not found.'}, status=404)
        cart = Cart.objects.get(customer=request.user)
        return Response(CartSerializer(cart, context={'request': request}).data)

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from .models import Order, OrderItem
from .serializers import OrderSerializer, PlaceOrderSerializer
from cart.models import Cart
from campus.models import CampusZone
from notifications.utils import notify_order_placed, notify_order_status_changed
from accounts.models import User
from .utils import  auto_assign_delivery_partner
from django.db import models

class OrderListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role == 'CUSTOMER':
            orders = Order.objects.filter(customer=user).prefetch_related('items')
        elif user.role == 'VENDOR':
            try:
                vendor = user.vendor_profile
                order_ids = OrderItem.objects.filter(vendor=vendor).values_list('order_id', flat=True).distinct()
                orders = Order.objects.filter(id__in=order_ids).prefetch_related('items')
            except Exception:
                orders = Order.objects.none()
        elif user.role == 'DELIVERY':
            orders = Order.objects.filter(delivery_partner=user).prefetch_related('items')
        elif user.role == 'ADMIN':
            orders = Order.objects.all().prefetch_related('items')
        else:
            orders = Order.objects.none()

        serializer = OrderSerializer(orders, many=True, context={'request': request})
        return Response(serializer.data)

    @transaction.atomic
    def post(self, request):
        """Place a new order from cart."""
        if request.user.role != 'CUSTOMER':
            return Response({'error': 'Only customers can place orders.'}, status=403)

        serializer = PlaceOrderSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        delivery_address = serializer.validated_data['delivery_address']
        special_instructions = serializer.validated_data.get('special_instructions', '')

        # Validate campus zone
        zones = CampusZone.objects.filter(is_active=True)
        matched_zone = None
        for zone in zones:
            keywords = zone.get_keywords()
            if any(kw in delivery_address.lower() for kw in keywords):
                matched_zone = zone
                break

        if not matched_zone:
            return Response({
                'error': 'Delivery not available to this address. Please enter a valid campus location.'
            }, status=400)

        # Get cart
        try:
            cart = Cart.objects.prefetch_related('items__product__vendor').get(customer=request.user)
        except Cart.DoesNotExist:
            return Response({'error': 'Cart is empty.'}, status=400)

        if not cart.items.exists():
            return Response({'error': 'Cart is empty.'}, status=400)

        # Create Order
        order = Order.objects.create(
            customer=request.user,
            delivery_address=delivery_address,
            campus_zone=matched_zone,
            special_instructions=special_instructions,
            total_price=cart.total_price,
        )

        # Create OrderItems
        for item in cart.items.select_related('product__vendor'):
            OrderItem.objects.create(
                order=order,
                product=item.product,
                vendor=item.product.vendor,
                product_name=item.product.name,
                quantity=item.quantity,
                unit_price=item.product.price,
            )

        # Clear cart
        cart.items.all().delete()

        # Send notifications
        notify_order_placed(order)

        return Response(OrderSerializer(order, context={'request': request}).data, status=201)


class OrderDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, order_id):
        order = self._get_order(request, order_id)
        if isinstance(order, Response):
            return order
        return Response(OrderSerializer(order, context={'request': request}).data)

    def _get_order(self, request, order_id):
        try:
            order = Order.objects.prefetch_related('items').get(order_id=order_id)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found'}, status=404)

        user = request.user
        if user.role == 'CUSTOMER' and order.customer != user:
            return Response({'error': 'Forbidden'}, status=403)
        if user.role == 'DELIVERY' and order.delivery_partner != user:
            return Response({'error': 'Forbidden'}, status=403)
        if user.role == 'VENDOR':
            try:
                if not order.items.filter(vendor=user.vendor_profile).exists():
                    return Response({'error': 'Forbidden'}, status=403)
            except Exception:
                return Response({'error': 'Forbidden'}, status=403)
        return order


class OrderStatusUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    # Allowed transitions per role
    VENDOR_TRANSITIONS = {
        'PLACED': ['ACCEPTED', 'CANCELLED'],
        'ACCEPTED': ['PREPARING'],
        'PREPARING': ['READY'],
    }
    DELIVERY_TRANSITIONS = {
        'READY': ['OUT_FOR_DELIVERY'],
        'OUT_FOR_DELIVERY': ['DELIVERED'],
    }
    ADMIN_TRANSITIONS = {
        'PLACED': ['ACCEPTED', 'CANCELLED'],
        'ACCEPTED': ['PREPARING', 'CANCELLED'],
        'PREPARING': ['READY', 'CANCELLED'],
        'READY': ['OUT_FOR_DELIVERY', 'CANCELLED'],
        'OUT_FOR_DELIVERY': ['DELIVERED', 'CANCELLED'],
    }

    def put(self, request, order_id):
        try:
            order = Order.objects.get(order_id=order_id)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found'}, status=404)

        new_status = request.data.get('status')
        user = request.user

        if user.role == 'VENDOR':
            allowed = self.VENDOR_TRANSITIONS.get(order.status, [])
            try:
                if not order.items.filter(vendor=user.vendor_profile).exists():
                    return Response({'error': 'Forbidden'}, status=403)
            except Exception:
                return Response({'error': 'Forbidden'}, status=403)
        elif user.role == 'DELIVERY':
            allowed = self.DELIVERY_TRANSITIONS.get(order.status, [])
            if order.delivery_partner != user:
                return Response({'error': 'Forbidden'}, status=403)
        elif user.role == 'ADMIN':
            allowed = self.ADMIN_TRANSITIONS.get(order.status, [])
        else:
            return Response({'error': 'Forbidden'}, status=403)

        if new_status not in allowed:
            return Response({
                'error': f'Invalid status transition from {order.status} to {new_status}.',
                'allowed': allowed
            }, status=400)

        order.status = new_status
        #changes 
        if new_status == 'READY' and not order.delivery_partner:
            auto_assign_delivery_partner(order)

            
        if new_status == 'DELIVERED' and not order.is_paid:
            
            order.is_paid= True

            for item in order.items.all():
                vendor=item.vendor

                if vendor:
                    vendor.total_revenue += item.subtotal
                    vendor.save()
        #till here
        order.save()
        notify_order_status_changed(order)

        return Response(OrderSerializer(order, context={'request': request}).data)


class AssignDeliveryView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, order_id):
        if request.user.role != 'ADMIN':
            return Response({'error': 'Admin only'}, status=403)
        try:
            order = Order.objects.get(order_id=order_id)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found'}, status=404)

        partner_id = request.data.get('delivery_partner_id')
        try:
            partner = User.objects.get(id=partner_id, role='DELIVERY')
        except User.DoesNotExist:
            return Response({'error': 'Delivery partner not found'}, status=404)

        order.delivery_partner = partner
        order.save()
        return Response(OrderSerializer(order, context={'request': request}).data)


class AdminStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'ADMIN':
            return Response({'error': 'Forbidden'}, status=403)
        from products.models import Product
        from vendors.models import VendorProfile
        stats = {
            'total_orders': Order.objects.count(),
            'total_users': User.objects.count(),
            'total_vendors': VendorProfile.objects.count(),
            'approved_vendors': VendorProfile.objects.filter(is_approved=True).count(),
            'total_products': Product.objects.count(),
            'orders_by_status': {},
            'total_revenue': Order.objects.filter(is_paid=True).aggregate(total=models.Sum('total_price'))['total'] or 0,
        }
        for status_code, _ in Order.STATUS_CHOICES:
            stats['orders_by_status'][status_code] = Order.objects.filter(status=status_code).count()
        return Response(stats)

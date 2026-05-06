import uuid
import random
import string
from django.db import models
from accounts.models import User
from products.models import Product
from vendors.models import VendorProfile
from campus.models import CampusZone


def generate_order_id():
    chars = string.ascii_uppercase + string.digits
    suffix = ''.join(random.choices(chars, k=8))
    return f"DLG{suffix}"


class Order(models.Model):
    STATUS_CHOICES = [
        ('PLACED', 'Placed'),
        ('ACCEPTED', 'Accepted'),
        ('PREPARING', 'Preparing'),
        ('READY', 'Ready for Pickup'),
        ('OUT_FOR_DELIVERY', 'Out for Delivery'),
        ('DELIVERED', 'Delivered'),
        ('CANCELLED', 'Cancelled'),
    ]

    order_id = models.CharField(max_length=20, unique=True, default=generate_order_id)
    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    delivery_address = models.TextField()
    campus_zone = models.ForeignKey(CampusZone, on_delete=models.SET_NULL, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PLACED')
    total_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    delivery_partner = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='delivery_orders'
    )
    special_instructions = models.TextField(blank=True)
    is_paid = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Order {self.order_id} by {self.customer.username}"

    class Meta:
        ordering = ['-created_at']


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    vendor = models.ForeignKey(VendorProfile, on_delete=models.SET_NULL, null=True)
    product_name = models.CharField(max_length=200)  # snapshot at order time
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=8, decimal_places=2)

    def __str__(self):
        return f"{self.quantity}x {self.product_name}"

    @property
    def subtotal(self):
        return self.unit_price * self.quantity

from django.db import models
from accounts.models import User


class Notification(models.Model):
    EVENT_TYPES = [
        ('ORDER_PLACED', 'Order Placed'),
        ('ORDER_ACCEPTED', 'Order Accepted'),
        ('ORDER_REJECTED', 'Order Rejected'),
        ('ORDER_PREPARING', 'Order Preparing'),
        ('ORDER_READY', 'Order Ready'),
        ('OUT_FOR_DELIVERY', 'Out for Delivery'),
        ('ORDER_DELIVERED', 'Order Delivered'),
        ('ORDER_CANCELLED', 'Order Cancelled'),
        ('PAYMENT_SUCCESS', 'Payment Successful'),
        ('VENDOR_APPROVED', 'Vendor Approved'),
        ('GENERAL', 'General'),
    ]

    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=200)
    message = models.TextField()
    event_type = models.CharField(max_length=30, choices=EVENT_TYPES, default='GENERAL')
    is_read = models.BooleanField(default=False)
    related_order_id = models.CharField(max_length=20, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Notification for {self.recipient.username}: {self.title}"

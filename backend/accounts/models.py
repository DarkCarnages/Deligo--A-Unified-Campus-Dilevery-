from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ROLE_CHOICES = [
        ('CUSTOMER', 'Customer'),
        ('VENDOR', 'Vendor'),
        ('DELIVERY', 'Delivery Partner'),
        ('ADMIN', 'Admin'),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='CUSTOMER')
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    profile_picture = models.ImageField(upload_to='profiles/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.username} ({self.role})"

    @property
    def is_customer(self):
        return self.role == 'CUSTOMER'

    @property
    def is_vendor(self):
        return self.role == 'VENDOR'

    @property
    def is_delivery(self):
        return self.role == 'DELIVERY'

    @property
    def is_admin_user(self):
        return self.role == 'ADMIN'

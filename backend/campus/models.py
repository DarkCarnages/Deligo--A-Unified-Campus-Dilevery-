from django.db import models


class CampusZone(models.Model):
    ZONE_TYPES = [
        ('HOSTEL', 'Hostel'),
        ('DEPT', 'Department'),
        ('ACADEMIC', 'Academic Building'),
        ('COMMON', 'Common Area'),
    ]
    name = models.CharField(max_length=100)
    zone_type = models.CharField(max_length=20, choices=ZONE_TYPES, default='COMMON')
    address_keywords = models.TextField(
        help_text="Comma-separated keywords to match delivery addresses"
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.zone_type})"

    def get_keywords(self):
        return [kw.strip().lower() for kw in self.address_keywords.split(',') if kw.strip()]

from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from accounts.models import User
from vendors.models import VendorProfile


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(unique=True)
    icon = models.CharField(max_length=50, blank=True, default='🛍️')

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = 'Categories'


class SubCategory(models.Model):
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='subcategories')
    name = models.CharField(max_length=100)
    slug = models.SlugField()

    def __str__(self):
        return f"{self.category.name} > {self.name}"

    class Meta:
        unique_together = ('category', 'slug')
        verbose_name_plural = 'SubCategories'


class Product(models.Model):
    vendor = models.ForeignKey(VendorProfile, on_delete=models.CASCADE, related_name='products')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='products')
    subcategory = models.ForeignKey(SubCategory, on_delete=models.SET_NULL, null=True, blank=True, related_name='products')
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=8, decimal_places=2, validators=[MinValueValidator(0)])
    image = models.ImageField(upload_to='products/', blank=True, null=True)
    is_available = models.BooleanField(default=True)
    avg_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    total_ratings = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} - {self.vendor.shop_name}"

    def update_rating(self):
        reviews = self.reviews.all()
        if reviews.exists():
            total = sum(r.rating for r in reviews)
            self.avg_rating = round(total / reviews.count(), 2)
            self.total_ratings = reviews.count()
        else:
            self.avg_rating = 0
            self.total_ratings = 0
        self.save(update_fields=['avg_rating', 'total_ratings'])


class Review(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews')
    order = models.ForeignKey('orders.Order', on_delete=models.CASCADE, related_name='reviews')
    rating = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('product', 'customer', 'order')

    def __str__(self):
        return f"Review by {self.customer.username} for {self.product.name} - {self.rating}★"

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from campus.models import CampusZone
from products.models import Category, SubCategory
from vendors.models import VendorProfile

User = get_user_model()


class Command(BaseCommand):
    help = 'Seed initial data: admin user, campus zones, categories'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding database...')

        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser(
                username='admin', email='admin@deligo.campus', password='admin123',
                first_name='Super', last_name='Admin', role='ADMIN', phone_number='9999999999',
            )
            self.stdout.write(self.style.SUCCESS('[OK] Admin created: admin / admin123'))
        else:
            self.stdout.write('[INFO] Admin already exists')

        if not User.objects.filter(username='vendor1').exists():
            vu = User.objects.create_user(
                username='vendor1', email='vendor1@deligo.campus', password='vendor123',
                first_name='Campus', last_name='Canteen', role='VENDOR', phone_number='9876543210',
            )
            VendorProfile.objects.create(user=vu, shop_name='Campus Canteen',
                description='Fresh food and beverages.', is_approved=True)
            self.stdout.write(self.style.SUCCESS('[OK] Vendor1: vendor1 / vendor123'))

        if not User.objects.filter(username='vendor2').exists():
            vu2 = User.objects.create_user(
                username='vendor2', email='vendor2@deligo.campus', password='vendor123',
                first_name='Stationery', last_name='Hub', role='VENDOR', phone_number='9123456780',
            )
            VendorProfile.objects.create(user=vu2, shop_name='Stationery Hub',
                description='All stationery needs.', is_approved=True)
            self.stdout.write(self.style.SUCCESS('[OK] Vendor2: vendor2 / vendor123'))

        if not User.objects.filter(username='student1').exists():
            User.objects.create_user(
                username='student1', email='student1@deligo.campus', password='student123',
                first_name='Rahul', last_name='Kumar', role='CUSTOMER', phone_number='9012345678',
            )
            self.stdout.write(self.style.SUCCESS('[OK] Customer: student1 / student123'))

        if not User.objects.filter(username='delivery1').exists():
            User.objects.create_user(
                username='delivery1', email='delivery1@deligo.campus', password='delivery123',
                first_name='Ravi', last_name='Sharma', role='DELIVERY', phone_number='9988776655',
            )
            self.stdout.write(self.style.SUCCESS('[OK] Delivery: delivery1 / delivery123'))

        zones = [
            ('Hostel A', 'HOSTEL', 'hostel a, hostel-a, ha block'),
            ('Hostel B', 'HOSTEL', 'hostel b, hostel-b, hb block'),
            ('Hostel C', 'HOSTEL', 'hostel c, hostel-c, hc block'),
            ('CSE Block', 'DEPT', 'cse block, cse department, computer science, cs dept'),
            ('Library', 'ACADEMIC', 'library, central library, lib'),
            ('Main Building', 'ACADEMIC', 'main building, admin block, administrative block'),
            ('ECE Block', 'DEPT', 'ece block, ece department, electronics, ec dept'),
            ('Sports Complex', 'COMMON', 'sports complex, ground, sports, stadium'),
        ]
        for name, ztype, keywords in zones:
            _, created = CampusZone.objects.get_or_create(
                name=name, defaults={'zone_type': ztype, 'address_keywords': keywords, 'is_active': True}
            )
            if created:
                self.stdout.write(f'  Zone: {name}')
        self.stdout.write(self.style.SUCCESS('[OK] Campus zones seeded'))

        cat_data = [
            ('Food', 'food', [('Breakfast','breakfast'),('Lunch','lunch'),
                              ('Dinner','dinner'),('Beverages','beverages'),('Snacks','snacks')]),
            ('Stationery', 'stationery', [('Writing Supplies','writing-supplies'),
                ('Notebooks','notebooks'),('Office Supplies','office-supplies'),('Art Supplies','art-supplies')]),
        ]
        for cname, cslug, subs in cat_data:
            cat, created = Category.objects.get_or_create(
                slug=cslug, defaults={'name': cname, 'icon': cname.lower()}
            )
            if created:
                self.stdout.write(f'  Category: {cname}')
            for sname, sslug in subs:
                SubCategory.objects.get_or_create(category=cat, slug=sslug, defaults={'name': sname})
        self.stdout.write(self.style.SUCCESS('[OK] Categories seeded'))
        self.stdout.write(self.style.SUCCESS('[DONE] Seeding complete!'))

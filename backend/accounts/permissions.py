from rest_framework.permissions import BasePermission


class IsCustomer(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'CUSTOMER'


class IsVendor(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'VENDOR'


class IsApprovedVendor(BasePermission):
    def has_permission(self, request, view):
        if not (request.user.is_authenticated and request.user.role == 'VENDOR'):
            return False
        try:
            return request.user.vendor_profile.is_approved
        except Exception:
            return False


class IsDelivery(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'DELIVERY'


class IsAdminUser(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'ADMIN'


class IsAdminOrVendor(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['ADMIN', 'VENDOR']


class IsCustomerOrAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['CUSTOMER', 'ADMIN']

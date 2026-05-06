from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from .models import VendorProfile
from .serializers import VendorProfileSerializer, VendorPublicSerializer


class VendorListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        vendors = VendorProfile.objects.filter(is_approved=True)
        serializer = VendorPublicSerializer(vendors, many=True, context={'request': request})
        return Response(serializer.data)


class VendorDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, vendor_id):
        try:
            vendor = VendorProfile.objects.get(id=vendor_id, is_approved=True)
        except VendorProfile.DoesNotExist:
            return Response({'error': 'Vendor not found'}, status=404)
        serializer = VendorPublicSerializer(vendor, context={'request': request})
        return Response(serializer.data)


class VendorProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'VENDOR':
            return Response({'error': 'Not a vendor'}, status=403)
        try:
            profile = request.user.vendor_profile
        except VendorProfile.DoesNotExist:
            return Response({'error': 'Profile not found'}, status=404)
        serializer = VendorProfileSerializer(profile, context={'request': request})
        return Response(serializer.data)

    def put(self, request):
        if request.user.role != 'VENDOR':
            return Response({'error': 'Not a vendor'}, status=403)
        try:
            profile = request.user.vendor_profile
        except VendorProfile.DoesNotExist:
            return Response({'error': 'Profile not found'}, status=404)
        serializer = VendorProfileSerializer(profile, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)


class VendorApprovalView(APIView):
    """Admin: approve or reject vendor."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'ADMIN':
            return Response({'error': 'Forbidden'}, status=403)
        vendors = VendorProfile.objects.all().order_by('-created_at')
        serializer = VendorProfileSerializer(vendors, many=True, context={'request': request})
        return Response(serializer.data)

    def put(self, request, vendor_id):
        if request.user.role != 'ADMIN':
            return Response({'error': 'Forbidden'}, status=403)
        try:
            vendor = VendorProfile.objects.get(id=vendor_id)
        except VendorProfile.DoesNotExist:
            return Response({'error': 'Vendor not found'}, status=404)
        is_approved = request.data.get('is_approved')
        if is_approved is not None:
            vendor.is_approved = is_approved
            vendor.save()
            from notifications.utils import send_notification
            send_notification(
                recipient=vendor.user,
                title="Vendor Status Updated",
                message=f"Your vendor account has been {'approved' if is_approved else 'rejected'}.",
                event_type='VENDOR_APPROVED',
            )
        serializer = VendorProfileSerializer(vendor, context={'request': request})
        return Response(serializer.data)

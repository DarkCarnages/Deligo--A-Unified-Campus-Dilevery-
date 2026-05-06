from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import CampusZone
from .serializers import CampusZoneSerializer, AddressValidationSerializer


class CampusZoneListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        zones = CampusZone.objects.filter(is_active=True)
        serializer = CampusZoneSerializer(zones, many=True)
        return Response(serializer.data)


class ValidateAddressView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = AddressValidationSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        address = serializer.validated_data['address'].lower()
        zones = CampusZone.objects.filter(is_active=True)

        for zone in zones:
            keywords = zone.get_keywords()
            if any(kw in address for kw in keywords):
                return Response({
                    'valid': True,
                    'zone': CampusZoneSerializer(zone).data,
                    'message': f'Delivery available to {zone.name}.'
                })

        return Response({
            'valid': False,
            'zone': None,
            'message': 'Delivery is not available to this address. Please enter a valid campus location.'
        }, status=400)


class CampusZoneAdminView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'ADMIN':
            return Response({'error': 'Forbidden'}, status=403)
        zones = CampusZone.objects.all()
        return Response(CampusZoneSerializer(zones, many=True).data)

    def post(self, request):
        if request.user.role != 'ADMIN':
            return Response({'error': 'Forbidden'}, status=403)
        serializer = CampusZoneSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


class CampusZoneDetailAdminView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, zone_id):
        if request.user.role != 'ADMIN':
            return Response({'error': 'Forbidden'}, status=403)
        try:
            zone = CampusZone.objects.get(id=zone_id)
        except CampusZone.DoesNotExist:
            return Response({'error': 'Zone not found'}, status=404)
        serializer = CampusZoneSerializer(zone, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def delete(self, request, zone_id):
        if request.user.role != 'ADMIN':
            return Response({'error': 'Forbidden'}, status=403)
        try:
            zone = CampusZone.objects.get(id=zone_id)
            zone.delete()
            return Response({'message': 'Zone deleted'})
        except CampusZone.DoesNotExist:
            return Response({'error': 'Zone not found'}, status=404)

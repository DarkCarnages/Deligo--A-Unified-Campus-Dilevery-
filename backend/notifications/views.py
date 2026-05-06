from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Notification
from .serializers import NotificationSerializer


class NotificationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        notifications = Notification.objects.filter(recipient=request.user).order_by('-created_at')[:50]
        serializer = NotificationSerializer(notifications, many=True)
        unread_count = Notification.objects.filter(recipient=request.user, is_read=False).count()
        return Response({
            'notifications': serializer.data,
            'unread_count': unread_count,
        })


class MarkReadView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, notification_id):
        try:
            notif = Notification.objects.get(id=notification_id, recipient=request.user)
            notif.is_read = True
            notif.save()
            return Response({'message': 'Marked as read.'})
        except Notification.DoesNotExist:
            return Response({'error': 'Notification not found.'}, status=404)

    def delete(self, request, notification_id):
        try:
            notif = Notification.objects.get(id=notification_id, recipient=request.user)
            notif.delete()
            return Response({'message': 'Deleted.'})
        except Notification.DoesNotExist:
            return Response({'error': 'Notification not found.'}, status=404)


class MarkAllReadView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        Notification.objects.filter(recipient=request.user, is_read=False).update(is_read=True)
        return Response({'message': 'All notifications marked as read.'})

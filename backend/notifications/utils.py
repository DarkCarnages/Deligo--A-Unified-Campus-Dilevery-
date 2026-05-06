from django.core.mail import send_mail
from django.conf import settings
from notifications.models import Notification


def send_notification(recipient, title, message, event_type, order_id=''):
    """Create in-app notification and send email."""
    Notification.objects.create(
        recipient=recipient,
        title=title,
        message=message,
        event_type=event_type,
        related_order_id=order_id,
    )
    try:
        send_mail(
            subject=f"[Deligo] {title}",
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[recipient.email],
            fail_silently=True,
        )
    except Exception:
        pass


def notify_order_placed(order):
    customer = order.customer
    send_notification(
        recipient=customer,
        title="Order Placed Successfully!",
        message=f"Your order {order.order_id} has been placed. We'll notify you once it's accepted.",
        event_type='ORDER_PLACED',
        order_id=order.order_id,
    )
    # Notify all vendors involved
    vendor_ids = order.items.values_list('vendor_id', flat=True).distinct()
    from vendors.models import VendorProfile
    for vp in VendorProfile.objects.filter(id__in=vendor_ids):
        send_notification(
            recipient=vp.user,
            title="New Order Received!",
            message=f"You have a new order {order.order_id}. Please accept or reject it.",
            event_type='ORDER_PLACED',
            order_id=order.order_id,
        )


def notify_order_status_changed(order):
    status_messages = {
        'ACCEPTED': ("Order Accepted", "Great news! Your order {} has been accepted and will be prepared soon."),
        'PREPARING': ("Order Being Prepared", "Your order {} is now being prepared."),
        'READY': ("Order Ready!", "Your order {} is ready for pickup/delivery."),
        'OUT_FOR_DELIVERY': ("Out for Delivery", "Your order {} is on the way! You can call your delivery partner."),
        'DELIVERED': ("Order Delivered", "Your order {} has been delivered. Enjoy! Please leave a review."),
        'CANCELLED': ("Order Cancelled", "Your order {} has been cancelled."),
    }
    if order.status in status_messages:
        title, msg_template = status_messages[order.status]
        send_notification(
            recipient=order.customer,
            title=title,
            message=msg_template.format(order.order_id),
            event_type=f'ORDER_{order.status}' if order.status not in ['OUT_FOR_DELIVERY'] else 'OUT_FOR_DELIVERY',
            order_id=order.order_id,
        )

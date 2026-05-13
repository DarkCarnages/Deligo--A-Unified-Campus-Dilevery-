from accounts.models import User
from .models import Order


def auto_assign_delivery_partner(order):

    delivery_partners = User.objects.filter(role='DELIVERY')

    if not delivery_partners.exists():
        return None

    partner_loads = []

    for partner in delivery_partners:

        active_orders = Order.objects.filter(
            delivery_partner=partner,
            status__in=['READY', 'OUT_FOR_DELIVERY']
        ).count()

        partner_loads.append((partner, active_orders))

    partner_loads.sort(key=lambda x: x[1])

    selected_partner = partner_loads[0][0]

    order.delivery_partner = selected_partner
    order.save()

    return selected_partner
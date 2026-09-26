import { getAuthSession } from '@/lib/session';
import { getPlans } from '@/lib/services/planService';
import { getCustomers } from '@/lib/services/customerService';
import { getSubscriptions } from '@/lib/services/subscriptionService';
import SubscriptionsClient from '@/components/subscriptions/SubscriptionsClient';

export default async function SubscriptionsPage() {
  const session = await getAuthSession();
  const providerId = session.user.providerId;

  const [plans, activeCustomersData, initialSubscriptionsData] = await Promise.all([
    getPlans(providerId),
    getCustomers(providerId, { filter: 'ACTIVE', limit: 1000 }), // Get active for dropdown
    getSubscriptions(providerId, { status: 'ALL', search: '', page: 1, limit: 50 })
  ]);

  return (
    <SubscriptionsClient
      initialPlans={plans || []}
      initialCustomers={activeCustomersData.customers || []}
      initialSubscriptions={initialSubscriptionsData.subscriptions || []}
      initialMetadata={initialSubscriptionsData.metadata || null}
    />
  );
}

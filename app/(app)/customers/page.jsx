import { getAuthSession } from '@/lib/session';
import { getCustomers } from '@/lib/services/customerService';
import CustomersClient from '@/components/customers/CustomersClient';

export default async function CustomersPage() {
  const session = await getAuthSession();
  const providerId = session.user.providerId;

  const data = await getCustomers(providerId, {
    search: '',
    filter: 'ACTIVE',
    page: 1,
    limit: 50
  });

  return (
    <CustomersClient
      initialCustomers={data.customers || []}
      initialMetadata={data.metadata || null}
    />
  );
}

import { getAuthSession } from '@/lib/session';
import { getMealHistory } from '@/lib/services/historyService';
import HistoryClient from '@/components/history/HistoryClient';

export default async function HistoryPage() {
  const session = await getAuthSession();
  const providerId = session.user.providerId;

  const data = await getMealHistory(providerId, {
    page: 1,
    limit: 100
  });

  return <HistoryClient initialData={data} />;
}

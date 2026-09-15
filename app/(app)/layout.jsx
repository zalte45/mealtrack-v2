import { redirect } from 'next/navigation';
import { getAuthSession } from '@/lib/session';
import AppShell from '@/components/layout/AppShell';

export default async function ProtectedAppLayout({ children }) {
  const session = await getAuthSession();

  if (!session || !session.user) {
    redirect('/login');
  }

  return <AppShell user={session.user}>{children}</AppShell>;
}

import { redirect } from 'next/navigation';
import { getAuthSession } from '@/lib/session';

export default async function HomePage() {
  const session = await getAuthSession();

  if (session?.user) {
    redirect('/counter');
  } else {
    redirect('/login');
  }
}

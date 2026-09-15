import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function getAuthSession() {
  return await getServerSession(authOptions);
}

export async function requireAuthUser() {
  const session = await getAuthSession();
  if (!session || !session.user) {
    const error = new Error('Unauthorized access');
    error.status = 401;
    throw error;
  }
  return session.user;
}

export async function requireOwnerRole() {
  const user = await requireAuthUser();
  if (user.role !== 'OWNER' && user.role !== 'ADMIN') {
    const error = new Error('Forbidden action. Owner privileges required.');
    error.status = 403;
    throw error;
  }
  return user;
}

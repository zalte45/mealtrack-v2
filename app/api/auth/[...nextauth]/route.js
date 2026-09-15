import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

const nextAuthFn = typeof NextAuth === 'function' ? NextAuth : NextAuth.default;
const handler = nextAuthFn(authOptions);

export { handler as GET, handler as POST };

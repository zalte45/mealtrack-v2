import { getAuthSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import SettingsForm from '@/components/settings/SettingsForm';

export default async function SettingsPage() {
  const session = await getAuthSession();

  const provider = await prisma.provider.findUnique({
    where: { id: session.user.providerId },
    include: {
      users: {
        select: { id: true, name: true, email: true, role: true, createdAt: true },
      },
    },
  });

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Provider Settings & Staff Management
        </h1>
        <p className="text-sm font-medium text-slate-500">
          Manage business profile, operational alert thresholds and operator accounts
        </p>
      </div>

      <SettingsForm provider={provider} />
    </div>
  );
}

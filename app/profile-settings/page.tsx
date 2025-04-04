// app/settings/page.tsx
import { auth } from '@/auth';
import ProfileSettingsCard from "@/components/UserProfile";

export default async function SettingsPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    return <div className="container py-8">Not authenticated</div>;
  }

  return (
    <div className="container py-8">
      <ProfileSettingsCard userId={session.user.id} />
    </div>
  );
}
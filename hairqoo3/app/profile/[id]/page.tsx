import { ProfileView } from "@/app-shell/ProfileView";

interface Params {
  params: Promise<{ id: string }>;
}

export default async function ProfilePage({ params }: Params) {
  const { id } = await params;
  return <ProfileView id={id} />;
}

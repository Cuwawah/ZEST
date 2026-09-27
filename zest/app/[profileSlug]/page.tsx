import { notFound } from "next/navigation";
import { getUserProfile } from "@/app/actions/profile";
import ProfileClient from "./ProfileClient";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ profileSlug: string }>;
}) {
  const { profileSlug } = await params;
  const data = await getUserProfile(profileSlug);

  if (!data) notFound();

  return <ProfileClient profileSlug={profileSlug} initialData={data} />;
}

import { AuthForm } from "@/components/auth-form";
export const metadata = { title: "Sign in", robots: { index: false } };
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  return <AuthForm next={params.next} />;
}

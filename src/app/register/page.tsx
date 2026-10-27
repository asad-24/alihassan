import { AuthForm } from "@/components/auth-form";
export const metadata = {
  title: "Create an account",
  robots: { index: false },
};
export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  return <AuthForm register next={params.next} />;
}

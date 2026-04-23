import { AppLayout } from '@/components/layout/app-layout';

export default function ToeflLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout>{children}</AppLayout>;
}

import { AppLayout } from '@/components/layout/app-layout';

export default function ToeflLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="toefl-bright-scope">
      <AppLayout>{children}</AppLayout>
    </div>
  );
}

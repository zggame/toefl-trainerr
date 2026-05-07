import { ToeflShell } from '@/components/layout/toefl-shell';

export default function ToeflLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ToeflShell>{children}</ToeflShell>;
}

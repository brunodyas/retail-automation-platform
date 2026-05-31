import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

/**
 * Layout для основных публичных страниц.
 * Включает Header и Footer.
 */
export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}

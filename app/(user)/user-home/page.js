"use client";
import HeaderAuth from '@/app/landing/components/HeaderAuth';
import PetCardsSection from '@/app/landing/components/PetCardsSection';
import Footer from '@/app/landing/components/Footer';
import LayoutUserPage from "@/app/components/LayoutUser";

export default function UserHomePage() {
  return (
    <LayoutUserPage>
      <div className="relative min-h-screen flex flex-col">
        <HeaderAuth />
        <main className="flex-grow">
          <PetCardsSection />
        </main>
        <Footer />
      </div>
    </LayoutUserPage>
  );
}
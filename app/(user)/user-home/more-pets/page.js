"use client";
import { useState, useEffect } from "react";
import PetCard from "@/app/landing/components/PetCard";
import { getAdoptionCenters } from "@/app/(user)/user-home/services/petsServices";
import HeaderAuth from '@/app/landing/components/HeaderAuth';
import Footer from '@/app/landing/components/Footer';

const ITEMS_PER_PAGE = 6;

export default function MorePetsPage() {
  const [adoptionCenters, setAdoptionCenters] = useState([]);
  const [pages, setPages] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const centersWithPets = await getAdoptionCenters();

        const initialPages = {};
        centersWithPets.forEach(center => {
          initialPages[center.id] = 1;
        });

        setAdoptionCenters(centersWithPets);
        setPages(initialPages);
      } catch (err) {
        setError(err.message || "Error al cargar los datos");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleLoadMore = (centerId) => {
    setPages(prev => ({
      ...prev,
      [centerId]: (prev[centerId] || 1) + 1
    }));
  };

  if (loading) return <div className="text-center py-10">Cargando...</div>;
  if (error) return <div className="text-center text-red-500 py-10">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderAuth />
      <main className="px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-10">Mascotas disponibles por centro</h1>

        {adoptionCenters.map(center => {
          const pets = center.pets || [];
          const page = pages[center.id] || 1;
          const displayedPets = pets.slice(0, page * ITEMS_PER_PAGE);

          return (
            <div key={center.id} className="mb-12">
              <h2 className="text-2xl font-semibold mb-6">{center.name}</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedPets.map(pet => (
                  <PetCard key={pet.id} pet={pet} />
                ))}
              </div>

              {displayedPets.length < pets.length && (
                <div className="text-center mt-6">
                  <button
                    onClick={() => handleLoadMore(center.id)}
                    className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
                  >
                    Ver más mascotas
                  </button>
                  <p className="mt-2 text-gray-600">
                    Mostrando {displayedPets.length} de {pets.length} mascotas
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </main>
      <Footer />
    </div>
  );
}

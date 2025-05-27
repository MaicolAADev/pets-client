"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { getPets } from "@/app/(user)/user-home/services/petsServices";
import PetCard from "./PetCard";
import { useRouter } from "next/navigation";

export default function PetCardsSection() {
  const [pets, setPets] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  // Obtener mascotas de la API
  useEffect(() => {
    async function fetchPets() {
      try {
        const petsData = await getPets();

        // Asegurarse que petsData es un array
        const petsArray = Array.isArray(petsData)
          ? petsData
          : petsData?.data || petsData?.body || [];

        setPets(petsArray);
      } catch (err) {
        console.error("Error cargando mascotas:", err);
        setError(err.message);

        if (err.message.includes("autenticado")) {
          router.push("/login");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchPets();
  }, [router]);

  // Auto avance
  useEffect(() => {
    if (!isAutoPlaying || pets.length <= 1) return;
    const timer = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % pets.length);
    }, 5000);
    return () => clearTimeout(timer);
  }, [currentIndex, isAutoPlaying, pets]);

  const nextPet = () => {
    if (pets.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % pets.length);
  };

  const prevPet = () => {
    if (pets.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + pets.length) % pets.length);
  };

  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd || pets.length <= 1) return;
    const difference = touchStart - touchEnd;
    if (difference > 50) nextPet();
    if (difference < -50) prevPet();
    setTouchStart(null);
    setTouchEnd(null);
  };

  if (loading) {
    return (
      <section className="py-12 text-center text-gray-600">
        Cargando mascotas...
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12 text-center text-red-500">{error}</section>
    );
  }

  if (!pets || pets.length === 0) {
    return (
      <section className="py-12 text-center text-gray-600">
        No hay mascotas disponibles actualmente
      </section>
    );
  }

  return (
    <section className="bg-gradient-to-b from-white to-blue-50 py-12 md:py-16 relative overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Encabezado */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 md:mb-12"
        >
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2 md:mb-3">
            Encuentra a tu <span className="text-blue-600">compañero</span>
          </h2>
          <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto">
            Conoce a estos increíbles amigos que buscan un hogar
          </p>
        </motion.div>

        {/* Carrusel */}
        <div
          className="relative max-w-xs md:max-w-md lg:max-w-2xl mx-auto"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Botón anterior - Solo mostrar si hay más de 1 mascota */}
          {pets.length > 1 && (
            <button
              onClick={prevPet}
              className="hidden md:block absolute -left-12 lg:-left-16 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow-sm z-10 hover:bg-gray-50 transition-colors"
              aria-label="Mascota anterior"
            >
              <ChevronLeft className="h-4 w-4 text-gray-600" />
            </button>
          )}

          {/* Contenedor tarjetas */}
          <div className="overflow-hidden px-1">
            <div className="flex justify-center items-center h-[340px] md:h-[380px] relative">
              <AnimatePresence mode="popLayout" initial={false}>
                {/* Tarjeta anterior - Solo mostrar si hay más de 1 mascota */}
                {pets.length > 1 && (
                  <motion.div
                    key={`prev-${currentIndex}`}
                    initial={{ opacity: 0, x: -100, scale: 0.9 }}
                    animate={{ opacity: 0.6, x: -60, scale: 0.9 }}
                    exit={{ opacity: 0, x: -100, scale: 0.8 }}
                    transition={{ duration: 0.5 }}
                    className="absolute left-0 w-48 md:w-56 z-10"
                  >
                    <PetCard
                      pet={pets[(currentIndex - 1 + pets.length) % pets.length]}
                    />
                  </motion.div>
                )}

                {/* Tarjeta principal */}
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, x: 40, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -40, scale: 0.95 }}
                  transition={{ duration: 0.5 }}
                  className="relative z-20 w-56 md:w-64"
                >
                  <PetCard pet={pets[currentIndex]} isFeatured />
                </motion.div>

                {/* Tarjeta siguiente - Solo mostrar si hay más de 1 mascota */}
                {pets.length > 1 && (
                  <motion.div
                    key={`next-${currentIndex}`}
                    initial={{ opacity: 0, x: 100, scale: 0.9 }}
                    animate={{ opacity: 0.6, x: 60, scale: 0.9 }}
                    exit={{ opacity: 0, x: 100, scale: 0.8 }}
                    transition={{ duration: 0.5 }}
                    className="absolute right-0 w-48 md:w-56 z-10"
                  >
                    <PetCard pet={pets[(currentIndex + 1) % pets.length]} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Botón siguiente - Solo mostrar si hay más de 1 mascota */}
          {pets.length > 1 && (
            <button
              onClick={nextPet}
              className="hidden md:block absolute -right-12 lg:-right-16 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow-sm z-10 hover:bg-gray-50 transition-colors"
              aria-label="Siguiente mascota"
            >
              <ChevronRight className="h-4 w-4 text-gray-600" />
            </button>
          )}
        </div>

        {/* Indicadores - Solo mostrar si hay más de 1 mascota */}
        {pets.length > 1 && (
          <div className="flex justify-center mt-6 md:mt-8 gap-1.5">
            {pets.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? "bg-blue-600 w-4 md:w-6"
                    : "bg-gray-300"
                }`}
                aria-label={`Ir a mascota ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Botón CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mt-8 md:mt-10"
        >
          <button
            onClick={() => router.push("/user-home/more-pets")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 md:px-6 md:py-2.5 rounded-lg text-sm md:text-base font-medium inline-flex items-center transition-colors shadow-sm hover:shadow-md"
          >
            Ver más mascotas
            <ArrowRight className="ml-1.5 h-3.5 w-3.5 md:h-4 md:w-4" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}

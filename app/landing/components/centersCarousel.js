"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { getPets } from "@/app/(user)/user-home/services/petsServices";
import PetCard from "./PetCard";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function PetCardsSection() {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchPets() {
      try {
        const petsData = await getPets();
        const petsArray = Array.isArray(petsData)
          ? petsData
          : petsData?.data || petsData?.body || [];

        setPets(petsArray);
        console.log(petsArray)
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
    <section className="bg-gradient-to-b from-white to-blue-50 py-12 md:py-16 relative">
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

        {/* Carrusel con react-responsive-carousel */}
        <div className="max-w-sm md:max-w-lg lg:max-w-3xl mx-auto">
          <Carousel
            showArrows={true}
            showThumbs={false}
            showStatus={false}
            infiniteLoop
            autoPlay
            interval={5000}
            stopOnHover
            swipeable
            emulateTouch
            className="rounded-lg shadow-md"
          >
            {pets.map((pet, index) => (
              <div key={index} className="px-6 py-4">
                <PetCard pet={pet} isFeatured />
              </div>
            ))}
          </Carousel>
        </div>

        {/* Botón CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mt-8 md:mt-10"
        >
          <button
            onClick={() => router.push("/pets")}
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

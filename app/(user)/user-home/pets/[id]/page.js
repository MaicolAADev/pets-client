"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getPetById } from "@/app/(user)/user-home/services/petsServices";
import Navigation from "@/app/landing/components/Navigation";
import Footer from "@/app/landing/components/Footer";
import { MapPin, Heart, Phone, Mail, Clock } from "lucide-react";
import HeaderAuth from "@/app/landing/components/HeaderAuth";
import { getEnv } from "@/utils/api";
import { Galleria } from "primereact/galleria";
import ImageModal from "../../components/ImageModal";

export default function PetProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const [pet, setPet] = useState(null);
  const [center, setCenter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [images, setImages] = useState([]);
  const [activeImage, setActiveImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const backendUrl = getEnv();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const petData = await getPetById(id);
        setPet(petData);

        const images = (petData?.files || []).map((file) => ({
          itemImageSrc: `${backendUrl}/${file.webPath}`,
          thumbnailImageSrc: `${backendUrl}/${file.webPath}`,
          alt: `Imagen ${file.id}`,
          title: file.filePath,
        }));
        setImages(images);
        setCenter(petData.adoptionCenter);
      } catch (err) {
        setError(err.message || "No pudimos cargar la información");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  const handleAdoptClick = () => {
    if (!pet || !center) return;
    const mensaje = `Hola, estoy interesado en adoptar a ${pet.name}. ¿Podrían darme más información?`;
    const url = `https://wa.me/57${center.phone}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, "_blank");
  };

  const handleLike = () => setIsLiked(!isLiked);

  const openModal = (img) => {
    setActiveImage(img);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setActiveImage(null), 300);
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation />
      <main className="flex-grow flex items-center justify-center">
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Cargando información de la mascota...</p>
        </div>
      </main>
      <Footer />
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation />
      <main className="flex-grow flex items-center justify-center">
        <div className="text-center py-10 text-red-500">
          <p>{error}</p>
          <button
            onClick={() => router.push("/pets")}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
          >
            Volver al listado
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );

  if (!pet) return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation />
      <main className="flex-grow flex items-center justify-center">
        <div className="text-center py-10">
          <p>Mascota no encontrada</p>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            onClick={() => router.push("/user/more-pets")}
          >
            Ver mascotas
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <HeaderAuth />
      <main className="flex-grow container mx-auto px-4 py-10" onClick={closeModal}>
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="w-full h-[90vh] min-h-[1000px] max-h-[1000px] bg-gray-100 rounded-t-xl overflow-hidden relative">
            {images.length > 0 ? (
              <Galleria
                value={images}
                numVisible={3}
                style={{ maxWidth: "100%", height: "100%" }}
                showThumbnails={true}
                showItemNavigators
                showItemNavigatorsOnHover
                circular
                autoPlay
                transitionInterval={5000}
                item={(item) => (
                  <div className="relative w-full h-full cursor-pointer" onClick={() => openModal(item.itemImageSrc)}>
                    <img
                      src={item.itemImageSrc}
                      alt={item.alt}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                thumbnail={(item) => (
                  <img
                    src={item.thumbnailImageSrc}
                    alt={item.alt}
                    className="h-16 object-cover rounded-md"
                  />
                )}
                className="custom-galleria"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                <p className="text-gray-500">No hay imágenes disponibles</p>
              </div>
            )}

            <button
              onClick={handleLike}
              className={`absolute top-4 right-4 p-3 rounded-full ${
                isLiked ? "bg-red-100 text-red-500" : "bg-white text-gray-400"
              } shadow-md transition-colors z-10`}
            >
              <Heart className="h-6 w-6" fill={isLiked ? "currentColor" : "none"} />
            </button>
          </div>

          {/* Contenido principal */}
          <div className="p-6 md:p-10 grid md:grid-cols-3 gap-8">
            {/* Información de la mascota */}
            <div className="md:col-span-2">
              <h1 className="text-3xl font-bold mb-2">{pet.name}</h1>
              <div className="flex items-center text-gray-600 mb-4">
                <MapPin className="h-5 w-5 mr-1" />
                <span>{pet.location}</span>
              </div>

              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Descripción</h2>
                <p className="text-gray-700">{pet.description || "No hay descripción disponible."}</p>
              </div>

              <button
                onClick={handleAdoptClick}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg text-lg font-medium transition"
              >
                Iniciar proceso de adopción
              </button>
            </div>

            {/* Información del centro de adopción */}
            {center && (
              <div className="border border-gray-200 rounded-lg p-6 h-fit">
                <h2 className="text-xl font-semibold mb-4">Centro de Adopción</h2>
                <h3 className="text-lg font-medium mb-2">{center.name}</h3>

                <div className="space-y-3">
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 mt-0.5 mr-2 text-gray-600" />
                    <p>{center.address}</p>
                  </div>

                  {center.phone && (
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 mr-2 text-gray-600" />
                      <a href={`tel:${center.phone}`} className="hover:underline">
                        {center.phone}
                      </a>
                    </div>
                  )}

                  {center.email && (
                    <div className="flex items-center">
                      <Mail className="h-5 w-5 mr-2 text-gray-600" />
                      <a href={`mailto:${center.email}`} className="hover:underline">
                        {center.email}
                      </a>
                    </div>
                  )}

                  {center.hours && (
                    <div className="flex items-start">
                      <Clock className="h-5 w-5 mt-0.5 mr-2 text-gray-600" />
                      <p>{center.hours}</p>
                    </div>
                  )}
                </div>

                {center.description && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="font-medium mb-2">Sobre el centro</h4>
                    <p className="text-sm text-gray-600">{center.description}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />

      {isModalOpen && (
        <ImageModal 
          images={images} 
          activeImage={activeImage} 
          onClose={closeModal} 
        />
      )}
    </div>
  );
}
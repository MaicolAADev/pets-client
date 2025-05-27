"use client";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, useContext } from "react";
import { apiGet, apiPut, getEnv } from "@/utils/api";
import SidebarC from "@/components/sidebar";
import PetsTable from "@/app/(admin)/pets/page";
import EditFormPet from "@/app/(admin)/pets/helpers/editFormPet";
import CustomTabView from "@/components/CustomTabView";
import { ToastContext } from "@/app/context/ToastContext";

import { Galleria } from "primereact/galleria";
import { Pencil } from "phosphor-react";

export default function PetDetail() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const action = searchParams.get("action") || "show";
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);

  const toastRef = useContext(ToastContext);

  useEffect(() => {
    fetchPet();
  }, [id]);

  const fetchPet = async () => {
    try {
      setLoading(true);
      const response = await apiGet(`/pets/${id}`);
      setPet(response.data.body);
    } catch (error) {
      showToast("error", "Error al obtener la mascota");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (formData) => {
    try {
      await apiPut(`/pets/${id}`, formData);
      router.push("/pets/" + id);
      await fetchPet();
      showToast("success", "Mascota actualizada correctamente");
    } catch (error) {
      showToast("error", "Error al actualizar la mascota");
    }
  };

  const showToast = (severity, message) => {
    toastRef.current?.show({
      severity,
      summary: severity === "success" ? "Éxito" : "Error",
      detail: message,
      life: 3000,
    });
  };

  return (
    <>
      <PetsTable />
      <SidebarC
        open={true}
        className="w-[30rem]"
        title={action === "edit" ? "Editar Mascota" : "Detalle de la Mascota"}
        onClose={() => router.push("/pets")}
        onSave={action === "edit" ? handleSave : null}
      >
        {loading ? (
          <p>Cargando...</p>
        ) : action === "edit" ? (
          <EditFormPet edit={true} pet={pet} onSave={handleSave} />
        ) : (
          <DetailView pet={pet} />
        )}
      </SidebarC>
    </>
  );
}

function DetailView({ pet }) {
  const backendUrl = getEnv();

  const images = (pet?.files || []).map((file) => ({
    itemImageSrc: `${backendUrl}/${file.webPath}`,
    thumbnailImageSrc: `${backendUrl}/${file.webPath}`,
    alt: `Imagen ${file.id}`,
    title: file.filePath,
  }));

  const tabs = [
    {
      label: "Información General",
      content: (
        <div className="space-y-3 text-sm">
          <h3 className="text-2xl font-semibold">{pet.name}</h3>

          <div className="space-y-2 pt-4">
            <label className="block mb-1 font-medium">Tipo</label>
            <p>{pet?.petType?.name}</p>
          </div>

          <div className="space-y-2 pt-4">
            <label className="block mb-1 font-medium">Centro de adopción</label>
            <p>{pet.adoptionCenter.name}</p>
          </div>

          <div className="space-y-2 pt-4">
            <label className="block mb-1 font-medium">Descripción</label>
            <p>{pet.description}</p>
          </div>
        </div>
      ),
    },
    {
      label: "Fotos",
      content:
        images.length > 0 ? (
          <Galleria
            value={images}
            numVisible={3}
            style={{ maxWidth: "100%" }}
            showThumbnails={true}
            showItemNavigators
            showItemNavigatorsOnHover
            circular
            autoPlay
            transitionInterval={4000}
            item={(item) => (
              <img src={item.itemImageSrc} alt={item.alt} className="w-full" />
            )}
            thumbnail={(item) => (
              <img
                src={item.thumbnailImageSrc}
                alt={item.alt}
                className="max-h-8 object-cover rounded-md"
              />
            )}
          />
        ) : (
          <p className="text-gray-500">No hay fotos disponibles.</p>
        ),
    },
    {
      label: (
        <>
          <Pencil size={20} />
        </>
      ),
      content: <></>,
      route: "/pets/" + pet.id + "?action=edit",
    },
  ];

  return <CustomTabView tabs={tabs} />;
}

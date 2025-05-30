"use client";
import { useContext, useState } from "react";
import { useRouter } from "next/navigation";
import { apiPost } from "@/utils/api";
import SidebarC from "@/components/sidebar";
import { ToastContext } from "@/app/context/ToastContext";
import EditFormPet from "@/app/(admin)/pets/helpers/editFormPet";

export default function CreatePet() {
  const [pendingFiles, setPendingFiles] = useState([]);
  const toastRef = useContext(ToastContext);
  const router = useRouter();

  const handleFileUpload = async (filesBase64) => {
    setPendingFiles((prev) => [...prev, ...filesBase64]);
  };

  const handleSubmit = async (formData) => {
    if (!formData.name || !formData.adoptionCenterId || !formData.petType.id) {
      showToast("error", "Por favor completa todos los campos obligatorios.");
      return;
    }

    const payload = {
      ...formData,
      adoptionCenterId: Number(formData.adoptionCenterId),
      petTypeId: Number(formData.petType.id),
      
    };

    try {
      const response = await apiPost("/pets", payload);

      if (response.status !== 200) {
        showToast("error", "Error al crear la mascota");
        return;
      }

      const petId = response.data.body.id;

      if (pendingFiles.length > 0) {
        const uploadResponse = await apiPost("/file/upload-base64", {
          typeEntity: "PET",
          entityOwnerId: petId,
          files: pendingFiles,
        });

        if (uploadResponse.status !== 201) {
          showToast("error", "Error al subir los archivos");
          return;
        }
      }

      showToast("success", "Mascota creada correctamente");
      router.push("/pets/" + response.data.body.id);
    } catch (error) {
      showToast("error", "Error al crear la mascota");
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
    <SidebarC
      open={true}
      className="w-[30rem]"
      title={"Crear Mascota"}
      onClose={() => router.push("/pets")}
      onSave={handleSubmit}
    >
      <EditFormPet
        edit={false}
        onSave={handleSubmit}
        onSaveFiles={handleFileUpload}
      />
    </SidebarC>
  );
}

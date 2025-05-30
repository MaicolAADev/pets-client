"use client";
import { useState, useEffect, useContext } from "react";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { apiGet, apiPut, apiPost, getEnv } from "@/utils/api";
import { ToastContext } from "@/app/context/ToastContext";

export default function EditFormPet({ pet, onSave, edit = true, onSaveFiles }) {
  const toastRef = useContext(ToastContext);
  const backendUrl = getEnv();

  const [formData, setFormData] = useState({
    name: pet?.name || "",
    description: pet?.description || "",
    active: pet?.active || false,
    adoptionCenterId: pet?.adoptionCenter?.id || null,
    petType: { id: pet?.petType?.id || null },
  });

  const [adoptionCenters, setAdoptionCenters] = useState([]);
  const [petTypes, setPetTypes] = useState([]);
  const [files, setFiles] = useState(pet?.files || []);
  const [filesToDelete, setFilesToDelete] = useState([]);
  const [fileToPreview, setFileToPreview] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [requiredAttributes, setRequiredAttributes] = useState([]);
  const [attributeValues, setAttributeValues] = useState(
    pet?.attributeValues?.map(av => ({
      attribute: { id: av.attribute.id },
      value: av.value
    })) || []
  );

  useEffect(() => {
    if (formData.petType.id !== null) fetchAttributes();
  }, [formData.petType])

  useEffect(() => {
    fetchAdoptionCenters();
    fetchPetTypes();
  }, []);

  const handleAttributeChange = (attributeId, value) => {
    setAttributeValues((prev) => {
      const existingIndex = prev.findIndex(
        (av) => av.attribute.id === attributeId
      );

      if (existingIndex !== -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          attribute: { id: attributeId },
          value
        };
        return updated;
      }

      return [...prev, {
        attribute: { id: attributeId },
        value
      }];
    });
  };

  const fetchAttributes = async () => {
    const response = await apiGet("/pet-types/" + formData.petType.id);
    if (response.status !== 200) {
      showToast("error", "Error al obtener los atributos que requiere este tipo de mascota");
      return;
    }
    console.log("attributes", response.data.body.attributes);
    setRequiredAttributes(response.data.body.attributes || []);
  };

  const fetchAdoptionCenters = async () => {
    try {
      const response = await apiGet("/adoption-centers");
      setAdoptionCenters(response.data.body.data || []);
    } catch (error) {
      showToast("error", "Error al obtener los centros de adopción");
    }
  };

  const fetchPetTypes = async () => {
    try {
      const response = await apiGet("/pet-types");
      setPetTypes(response.data.body.data || []);
    } catch (error) {
      showToast("error", "Error al obtener los tipos de mascota");
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDropdownChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e) => {
    setFormData((prev) => ({ ...prev, active: e.checked }));
  };

  const handleFileUpload = async (e) => {
    const newFiles = Array.from(e.target.files);
    if (newFiles.length === 0) return;

    const filesToUpload = await Promise.all(
      newFiles.map(async (file) => {
        const base64 = await convertToBase64(file);
        return {
          name: file.name,
          base64: base64.split(",")[1],
        };
      }),
    );

    if (!edit) {
      onSaveFiles(filesToUpload);
      setFiles((prev) => [...prev, ...filesToUpload]);
      return;
    }

    const response = await apiPost("/file/upload-base64", {
      typeEntity: "PET",
      entityOwnerId: pet.id,
      files: filesToUpload,
    });

    if (response.status === 201) {
      setFiles(response.data.body);
      showToast("success", "Archivo(s) subido(s)");
    } else {
      showToast("error", "Error al subir archivos");
    }
  };

  const handleFileDelete = (fileId) => {
    setFilesToDelete((prev) => [...prev, fileId]);
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const deleteFiles = async () => {
    if (!filesToDelete.length) return;
    await apiPost("/file/delete", {
      file: filesToDelete.map((id) => ({ id })),
    });
    setFilesToDelete([]);
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
    });
  };

  const handleSubmit = async () => {
    if (!edit) {
      formData.attributeValues = attributeValues;
      onSave(formData);
      return;
    }

    if (!formData.name || !formData.adoptionCenterId || !formData.petType.id) {
      showToast("error", "Completa todos los campos.");
      return;
    }

    await deleteFiles();

    const payload = {
      name: formData.name,
      description: formData.description,
      active: true,
      adoptionCenterId: Number(formData.adoptionCenterId),
      petType: { id: Number(formData.petType.id) },
      attributeValues: attributeValues,
    };

    try {
      const response = await apiPut(`/pets/${pet.id}`, payload);
      if (response.status !== 200) {
        showToast("error", "Error al actualizar la mascota");
        showToast("error", response.data.message);
        return;
      }
      if (onSave) onSave(payload);
    } catch (error) {
      showToast("error", "Error al actualizar la mascota");
    }
  };

  return (
    <div className="p-4 bg-white rounded shadow-md">
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <div>
          <label className="block mb-1 font-medium">Nombre</label>
          <InputText
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Descripción</label>
          <InputTextarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full"
            rows={3}
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Centro de Adopción</label>
          <Dropdown
            value={formData.adoptionCenterId}
            options={adoptionCenters}
            optionLabel="name"
            optionValue="id"
            onChange={(e) => handleDropdownChange("adoptionCenterId", e.value)}
            placeholder="Selecciona un centro"
            className="w-full"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Tipo de Mascota</label>
          <Dropdown
            value={formData.petType.id}
            options={petTypes}
            optionLabel="name"
            optionValue="id"
            onChange={(e) => handleDropdownChange("petType", { id: e.value })}
            placeholder="Selecciona un tipo"
            className="w-full"
          />
        </div>

        <div className="mt-2 space-y-2">
          {requiredAttributes.map((attribute) => (
            <div key={attribute.id} className="flex flex-col gap-2">
              <label className="font-medium">
                {attribute.name}
                {attribute.allowedValues?.length > 0 && (
                  <span className="text-sm text-gray-500 ml-1">
                    (Opciones: {attribute.allowedValues.join(", ")})
                  </span>
                )}
              </label>
              {attribute.allowedValues?.length > 0 ? (
                <Dropdown
                  value={
                    attributeValues.find((av) => av.attribute.id === attribute.id)?.value || ""
                  }
                  options={attribute.allowedValues.map((val) => ({
                    label: val,
                    value: val,
                  }))}
                  onChange={(e) =>
                    handleAttributeChange(attribute.id, e.value)
                  }
                  placeholder={`Selecciona ${attribute.name}`}
                  className="w-full"
                />
              ) : (
                <InputText
                  value={
                    attributeValues.find((av) => av.attribute.id === attribute.id)?.value || ""
                  }
                  onChange={(e) =>
                    handleAttributeChange(attribute.id, e.target.value)
                  }
                  placeholder={`Ingresa ${attribute.name}`}
                  className="w-full"
                />
              )}
            </div>
          ))}
        </div>

        <div className="space-y-2 pt-4">
          <label className="p-button p-component cursor-pointer">
            <i className="pi pi-plus mr-2"></i> Subir archivos
            <input
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          <div className="border rounded">
            {files.length > 0 ? (
              <ul className="divide-y">
                {files.map((file) => (
                  <li
                    key={file.id}
                    className="p-3 flex justify-between items-center"
                  >
                    <div className="flex items-center gap-2">
                      <span>{file.name || file.filename}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setFileToPreview(file);
                          setIsPreviewOpen(true);
                        }}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <i className="pi pi-eye"></i>
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleFileDelete(file.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <i className="pi pi-times"></i>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-4 text-center text-gray-500">
                No hay archivos adjuntos
              </div>
            )}
          </div>
        </div>

        <div className="mt-auto pt-4">
          <Button
            type="submit"
            label="Guardar cambios"
            className="w-full h-9 bg-blue-500 text-white font-bold"
          />
        </div>
      </form>

      {isPreviewOpen && fileToPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">
                {fileToPreview.name || fileToPreview.filename}
              </h3>
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <i className="pi pi-times"></i>
              </button>
            </div>

            <div className="flex justify-center">
              {fileToPreview.webPath?.match(/\.(jpeg|jpg|gif|png)$/) ? (
                <img
                  src={`${backendUrl}/${fileToPreview.webPath}`}
                  alt="Preview"
                  className="max-w-full max-h-[70vh]"
                />
              ) : (
                <div className="p-8 text-center">
                  <i className="pi pi-file text-4xl text-gray-400 mb-2"></i>
                  <p>Vista previa no disponible</p>
                  <a
                    href={`${backendUrl}/${fileToPreview.webPath}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    Descargar archivo
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { apiGet } from "@/utils/api";

export const getAdoptionCenter = async (id) => {
  const response = await apiGet(`/adoption-centers/${id}`);

  if (!response.ok) {
    throw new Error("No se pudo obtener los datos del centro de adopción");
  }
  return response.data;
};
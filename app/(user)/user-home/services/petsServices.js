import { apiGet } from "@/utils/api";

export const getPets = async () => {
  const response = await apiGet("/pets");
  return response.data.body.data;
};

export const getPetById = async (id) => {
  const response = await apiGet("/pets/" + id);
  return response.data.body;
};

export const getAdoptionCenters = async () => {
  try {
    const pets = await getPets() || [];

    // Filtrar mascotas activas
    const activePets = pets.filter(p => p.active && p.adoptionCenter?.active);

    // Agrupar mascotas por centro
    const centersMap = new Map();

    for (const pet of activePets) {
      const centerId = pet.adoptionCenter.id;

      if (!centersMap.has(centerId)) {
        centersMap.set(centerId, {
          ...pet.adoptionCenter,
          pets: [],
        });
      }

      centersMap.get(centerId).pets.push(pet);
    }

    return Array.from(centersMap.values());

  } catch (err) {
    console.error("Error en getAdoptionCenters:", err);
    return [];
  }
};


export const getPetsByCenter = async (adoptionCenter) => {
  const pets = await getPets();
  return pets.filter((pet) => pet.adoptionCenter?.id == adoptionCenter);
};
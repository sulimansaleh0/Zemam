'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vehicleService } from '../services/vehicle.service';
import { CreateVehicleInput, UpdateVehicleInput } from '../types/vehicle.types';

export const VEHICLE_QUERY_KEYS = {
  allVehicles: ['vehicles'] as const,
  vehicleDetail: (vehicleId: string) => ['vehicles', vehicleId] as const,
  vehicleCompanies: ['vehicles', 'companies'] as const,
  vehicleTeams: ['vehicles', 'teams'] as const,
  vehicleDrivers: ['vehicles', 'drivers'] as const,
};

/**
 * Hook to fetch all vehicles
 */
export function useVehicles() {
  return useQuery({
    queryKey: VEHICLE_QUERY_KEYS.allVehicles,
    queryFn: vehicleService.getVehicles,
  });
}

/**
 * Hook to fetch a single vehicle by ID
 */
export function useVehicleById(vehicleId: string) {
  return useQuery({
    queryKey: VEHICLE_QUERY_KEYS.vehicleDetail(vehicleId),
    queryFn: () => vehicleService.getVehicleById(vehicleId),
    enabled: Boolean(vehicleId),
  });
}

/**
 * Hook to fetch vehicle form options (companies, teams, drivers)
 */
export function useVehicleOptions() {
  const vehicleCompaniesQuery = useQuery({
    queryKey: VEHICLE_QUERY_KEYS.vehicleCompanies,
    queryFn: vehicleService.getVehicleCompanies,
  });

  const vehicleTeamsQuery = useQuery({
    queryKey: VEHICLE_QUERY_KEYS.vehicleTeams,
    queryFn: vehicleService.getVehicleTeams,
  });

  const vehicleDriversQuery = useQuery({
    queryKey: VEHICLE_QUERY_KEYS.vehicleDrivers,
    queryFn: vehicleService.getVehicleDrivers,
  });

  return {
    companies: vehicleCompaniesQuery.data ?? [],
    teams: vehicleTeamsQuery.data ?? [],
    drivers: vehicleDriversQuery.data ?? [],
    isLoadingOptions:
      vehicleCompaniesQuery.isLoading ||
      vehicleTeamsQuery.isLoading ||
      vehicleDriversQuery.isLoading,
  };
}

/**
 * Mutation hook to create a new vehicle
 */
export function useCreateVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vehicleInput: CreateVehicleInput) =>
      vehicleService.createVehicle(vehicleInput),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VEHICLE_QUERY_KEYS.allVehicles });
    },
  });
}

/**
 * Mutation hook to update an existing vehicle
 */
export function useUpdateVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      vehicleId,
      vehicleInput,
    }: {
      vehicleId: string;
      vehicleInput: UpdateVehicleInput;
    }) => vehicleService.updateVehicle(vehicleId, vehicleInput),
    onSuccess: (_, { vehicleId }) => {
      queryClient.invalidateQueries({ queryKey: VEHICLE_QUERY_KEYS.allVehicles });
      queryClient.invalidateQueries({
        queryKey: VEHICLE_QUERY_KEYS.vehicleDetail(vehicleId),
      });
    },
  });
}

/**
 * Mutation hook to delete a vehicle
 */
export function useDeleteVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vehicleId: string) => vehicleService.deleteVehicle(vehicleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VEHICLE_QUERY_KEYS.allVehicles });
    },
  });
}

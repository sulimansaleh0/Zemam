import { MOCK_VEHICLES, MOCK_COMPANIES, MOCK_TEAMS, MOCK_DRIVERS } from '../data/mock-vehicles';
import {
  VehicleWithRelations,
  CreateVehicleInput,
  UpdateVehicleInput,
  Company,
  Team,
  Driver,
} from '../types/vehicle.types';

// Mock state dataset for vehicles
let vehiclesDataset: VehicleWithRelations[] = [...MOCK_VEHICLES];

export const vehicleService = {
  /**
   * Fetch all fleet vehicles
   */
  async getVehicles(): Promise<VehicleWithRelations[]> {
    return [...vehiclesDataset];
  },

  /**
   * Fetch single vehicle by its unique ID
   */
  async getVehicleById(vehicleId: string): Promise<VehicleWithRelations> {
    const foundVehicle = vehiclesDataset.find((v) => v.id === vehicleId);
    if (!foundVehicle) throw new Error('المركبة المطلوبة غير موجودة');
    return foundVehicle;
  },

  /**
   * Create and register a new vehicle
   */
  async createVehicle(vehicleInput: CreateVehicleInput): Promise<VehicleWithRelations> {
    const driver = MOCK_DRIVERS.find((d) => d.id === vehicleInput.driverId);
    const team = MOCK_TEAMS.find((t) => t.id === vehicleInput.teamId);
    const company = MOCK_COMPANIES.find((c) => c.id === vehicleInput.companyId);

    const newVehicle: VehicleWithRelations = {
      ...vehicleInput,
      id: `veh_${Date.now()}`,
      year: Number(vehicleInput.year),
      plateNumber: Number(vehicleInput.plateNumber),
      driverName: driver?.name || 'غير محدد',
      driverPhone: driver?.phone || '',
      teamName: team?.name || 'غير محدد',
      companyName: company?.name || 'غير محدد',
      status: 'active',
    };

    vehiclesDataset = [newVehicle, ...vehiclesDataset];
    return newVehicle;
  },

  /**
   * Update existing vehicle details
   */
  async updateVehicle(
    vehicleId: string,
    vehicleInput: UpdateVehicleInput
  ): Promise<VehicleWithRelations> {
    const vehicleIndex = vehiclesDataset.findIndex((v) => v.id === vehicleId);
    if (vehicleIndex === -1) throw new Error('المركبة المراد تعديلها غير موجودة');

    const driver = vehicleInput.driverId
      ? MOCK_DRIVERS.find((d) => d.id === vehicleInput.driverId)
      : undefined;
    const team = vehicleInput.teamId
      ? MOCK_TEAMS.find((t) => t.id === vehicleInput.teamId)
      : undefined;
    const company = vehicleInput.companyId
      ? MOCK_COMPANIES.find((c) => c.id === vehicleInput.companyId)
      : undefined;

    const currentVehicle = vehiclesDataset[vehicleIndex];
    const updatedVehicle: VehicleWithRelations = {
      ...currentVehicle,
      ...vehicleInput,
      year: vehicleInput.year !== undefined ? Number(vehicleInput.year) : currentVehicle.year,
      plateNumber:
        vehicleInput.plateNumber !== undefined
          ? Number(vehicleInput.plateNumber)
          : currentVehicle.plateNumber,
      driverName: driver ? driver.name : currentVehicle.driverName,
      driverPhone: driver ? driver.phone : currentVehicle.driverPhone,
      teamName: team ? team.name : currentVehicle.teamName,
      companyName: company ? company.name : currentVehicle.companyName,
    };

    vehiclesDataset[vehicleIndex] = updatedVehicle;
    return updatedVehicle;
  },

  /**
   * Delete vehicle by ID
   */
  async deleteVehicle(vehicleId: string): Promise<string> {
    vehiclesDataset = vehiclesDataset.filter((v) => v.id !== vehicleId);
    return vehicleId;
  },

  /**
   * Fetch relation lookup options for vehicles
   */
  async getVehicleCompanies(): Promise<Company[]> {
    return MOCK_COMPANIES;
  },

  async getVehicleTeams(): Promise<Team[]> {
    return MOCK_TEAMS;
  },

  async getVehicleDrivers(): Promise<Driver[]> {
    return MOCK_DRIVERS;
  },
};

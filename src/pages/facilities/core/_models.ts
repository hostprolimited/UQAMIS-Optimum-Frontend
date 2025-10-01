export interface entitiesData {
  facility_id: number;
  entities: Array<{
    grade?: string;
    stream?: string;
    name?: string;
    total: number;
  }>;
}
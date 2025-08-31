
import { SelectQueryBuilder } from 'typeorm';

interface Filters {
  minAge?: number;
  maxAge?: number;
  minHeight?: number;
  maxHeight?: number;
  languages?: string[];
  latitude?: number;
  longitude?: number;
  distance?: number;
  sexuality?: string;
  minWeight?: number;
  maxWeight?: number;
}

export class PaginationService {
  static applyFilters(
    queryBuilder: SelectQueryBuilder<any>, // Changed from UserEntity to any
    filters: Filters | undefined,
    entityAlias: string = 'user' // Entity alias to be used in query
  ): SelectQueryBuilder<any> {
    const now = new Date();

    if (filters?.minAge !== undefined || filters?.maxAge !== undefined) {
      const minDate = filters?.minAge ? new Date(now.getFullYear() - filters?.minAge, now.getMonth(), now.getDate()) : undefined;
      const maxDate = filters?.maxAge ? new Date(now.getFullYear() - filters?.maxAge, now.getMonth(), now.getDate()) : undefined;

      if (minDate && maxDate) {
        queryBuilder.andWhere(`${entityAlias}.birthday BETWEEN :minDate AND :maxDate`, { minDate, maxDate });
      } else if (minDate) {
        queryBuilder.andWhere(`${entityAlias}.birthday <= :minDate`, { minDate });
      } else if (maxDate) {
        queryBuilder.andWhere(`${entityAlias}.birthday >= :maxDate`, { maxDate });
      }
    }

    if (filters?.minHeight !== undefined || filters?.maxHeight !== undefined) {
      if (filters?.minHeight !== undefined && filters?.maxHeight !== undefined) {
        queryBuilder.andWhere(`${entityAlias}.personalDetail.height BETWEEN :minHeight AND :maxHeight`, { minHeight: filters?.minHeight, maxHeight: filters?.maxHeight });
      } else if (filters?.minHeight !== undefined) {
        queryBuilder.andWhere(`${entityAlias}.personalDetail.height >= :minHeight`, { minHeight: filters?.minHeight });
      } else if (filters?.maxHeight !== undefined) {
        queryBuilder.andWhere(`${entityAlias}.personalDetail.height <= :maxHeight`, { maxHeight: filters?.maxHeight });
      }
    }

    if (filters?.languages) {
      queryBuilder.andWhere(`${entityAlias}.personalDetail.language && ARRAY[:languages]`, { languages: filters?.languages });
    }

    if (filters?.distance !== undefined && filters?.latitude !== undefined && filters?.longitude !== undefined) {
      const earthRadius = 6371; // Radius of the Earth in kilometers

      queryBuilder.andWhere(
        `( ${earthRadius} * acos(
              cos(radians(:latitude)) * cos(radians(lat)) * 
              cos(radians(lon) - radians(:longitude)) + 
              sin(radians(:latitude)) * sin(radians(lat))
           )
        ) <= :radius`,
        {
          latitude: filters.latitude,
          longitude: filters.longitude,
          radius: filters.distance,
        },
      );
    }

    if (filters?.sexuality) {
      queryBuilder.andWhere(`${entityAlias}.sexualIdentity = :sexuality`, { sexuality: filters?.sexuality });
    }

    if (filters?.minWeight !== undefined || filters?.maxWeight !== undefined) {
      if (filters?.minWeight !== undefined && filters?.maxWeight !== undefined) {
        queryBuilder.andWhere(`${entityAlias}.personalDetail.weight BETWEEN :minWeight AND :maxWeight`, { minWeight: filters?.minWeight, maxWeight: filters?.maxWeight });
      } else if (filters?.minWeight !== undefined) {
        queryBuilder.andWhere(`${entityAlias}.personalDetail.weight >= :minWeight`, { minWeight: filters?.minWeight });
      } else if (filters?.maxWeight !== undefined) {
        queryBuilder.andWhere(`${entityAlias}.personalDetail.weight <= :maxWeight`, { maxWeight: filters?.maxWeight });
      }
    }

    return queryBuilder;
  }
}

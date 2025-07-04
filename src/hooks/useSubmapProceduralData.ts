
/**
 * @file useSubmapProceduralData.ts
 * Custom hook to manage procedural data generation for SubmapPane.
 * This includes tile hashing, seeded feature placement, and path details.
 */
import { useMemo, useCallback } from 'react';
import { LOCATIONS, STARTING_LOCATION_ID, BIOMES } from '../constants';

export interface SeededFeatureConfig {
  id: string;
  name?: string;
  icon: string;
  color: string;
  sizeRange: [number, number];
  numSeedsRange: [number, number];
  adjacency?: {
    icon?: string;
    color?: string;
  };
  zOffset?: number;
  scatterOverride?: Array<{ icon: string; density: number; color?: string; allowedOn?: string[] }>;
  generatesEffectiveTerrainType?: string;
  shapeType?: 'circular' | 'rectangular';
}

export interface PathDetails {
  mainPathCoords: Set<string>;
  pathAdjacencyCoords: Set<string>;
}

interface UseSubmapProceduralDataProps {
  submapDimensions: { rows: number; cols: number };
  currentWorldBiomeId: string;
  parentWorldMapCoords: { x: number; y: number };
  seededFeaturesConfig?: SeededFeatureConfig[];
  // playerSubmapCoordsForPath is removed
}

interface UseSubmapProceduralDataOutput {
  simpleHash: (submapX: number, submapY: number, seedSuffix: string) => number;
  activeSeededFeatures: Array<{ x: number; y: number; config: SeededFeatureConfig; actualSize: number }>;
  pathDetails: PathDetails;
}

export function useSubmapProceduralData({
  submapDimensions,
  currentWorldBiomeId,
  parentWorldMapCoords,
  seededFeaturesConfig,
}: UseSubmapProceduralDataProps): UseSubmapProceduralDataOutput {
  const worldBiome = BIOMES[currentWorldBiomeId];
  const biomeSeedText = worldBiome ? worldBiome.id + worldBiome.name : 'default_seed';

  const simpleHash = useCallback((submapX: number, submapY: number, seedSuffix: string): number => {
    let h = 0;
    const str = `${parentWorldMapCoords.x},${parentWorldMapCoords.y},${submapX},${submapY},${biomeSeedText},${seedSuffix}`;
    for (let i = 0; i < str.length; i++) {
      h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
    }
    return Math.abs(h);
  }, [biomeSeedText, parentWorldMapCoords]);

  const activeSeededFeatures = useMemo(() => {
    const features: Array<{ x: number; y: number; config: SeededFeatureConfig; actualSize: number }> = [];
    if (!seededFeaturesConfig) return features;

    seededFeaturesConfig.forEach((featureConfig, index) => {
      const featureTypeSeed = simpleHash(index, 0, `feature_type_${featureConfig.id}`);
      const numToPlace = featureTypeSeed % (featureConfig.numSeedsRange[1] - featureConfig.numSeedsRange[0] + 1) + featureConfig.numSeedsRange[0];

      for (let i = 0; i < numToPlace; i++) {
        const instanceSeedModifier = `instance_${i}`;
        const seedXHash = simpleHash(index, i, `seedX_${featureConfig.id}_${instanceSeedModifier}`);
        const seedYHash = simpleHash(index, i, `seedY_${featureConfig.id}_${instanceSeedModifier}`);
        const seedSizeHash = simpleHash(index, i, `seedSize_${featureConfig.id}_${instanceSeedModifier}`);

        features.push({
          x: seedXHash % submapDimensions.cols,
          y: seedYHash % submapDimensions.rows,
          config: featureConfig,
          actualSize: seedSizeHash % (featureConfig.sizeRange[1] - featureConfig.sizeRange[0] + 1) + featureConfig.sizeRange[0],
        });
      }
    });
    return features;
  }, [seededFeaturesConfig, submapDimensions, simpleHash]);

  const pathDetails = useMemo(() => {
    const mainPathCoords = new Set<string>();
    const pathAdjacencyCoords = new Set<string>();
    const { rows, cols } = submapDimensions;

    let pathChance = 70;
    if (currentWorldBiomeId === 'swamp') pathChance = 30;
    if (currentWorldBiomeId === 'ocean') pathChance = 0;
    
    const startingLocationData = LOCATIONS[STARTING_LOCATION_ID];
    const isStartingLocationSubmap = 
        startingLocationData &&
        currentWorldBiomeId === startingLocationData.biomeId &&
        parentWorldMapCoords.x === startingLocationData.mapCoordinates.x &&
        parentWorldMapCoords.y === startingLocationData.mapCoordinates.y;

    if (isStartingLocationSubmap) {
        pathChance = 100; 
    }

    if (simpleHash(0, 0, 'mainPathExists_v4') % 100 < pathChance) {
        const isVertical = simpleHash(1, 1, 'mainPathVertical_v4') % 2 === 0;
        let currentX, currentY;
        let pathPoints: {x: number, y: number}[] = [];

        if (isVertical) {
            currentX = Math.floor(cols / 2) + (simpleHash(2, 2, 'mainPathStartCol_v4') % Math.floor(cols / 3) - Math.floor(cols / 6));
            currentX = Math.max(1, Math.min(cols - 2, currentX)); 

            for (let y = 0; y < rows; y++) {
                pathPoints.push({x: currentX, y: y});
                if (y < rows - 1) {
                    const wobble = simpleHash(currentX, y, 'wobble_v_v4') % 3 - 1;
                    currentX = Math.max(1, Math.min(cols - 2, currentX + wobble));
                }
            }
        } else { 
            currentY = Math.floor(rows / 2) + (simpleHash(3, 3, 'mainPathStartRow_v4') % Math.floor(rows / 3) - Math.floor(rows / 6));
            currentY = Math.max(1, Math.min(rows - 2, currentY));

            for (let x = 0; x < cols; x++) {
                pathPoints.push({x: x, y: currentY});
                if (x < cols - 1) {
                    const wobble = simpleHash(x, currentY, 'wobble_h_v4') % 3 - 1;
                    currentY = Math.max(1, Math.min(rows - 2, currentY + wobble));
                }
            }
        }
        pathPoints.forEach(p => mainPathCoords.add(`${p.x},${p.y}`));
        
        if (isStartingLocationSubmap) {
            // Ensure the player's starting tile (center of submap) is explicitly part of the path
            const fixedStartX = Math.floor(submapDimensions.cols / 2);
            const fixedStartY = Math.floor(submapDimensions.rows / 2);
            mainPathCoords.add(`${fixedStartX},${fixedStartY}`);
        }
    }
    
    mainPathCoords.forEach(coordStr => {
        const [xStr, yStr] = coordStr.split(',');
        const x = parseInt(xStr);
        const y = parseInt(yStr);
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue;
                const adjX = x + dx;
                const adjY = y + dy;
                if (adjX >= 0 && adjX < cols && adjY >= 0 && adjY < rows) {
                    const adjCoordStr = `${adjX},${adjY}`;
                    if (!mainPathCoords.has(adjCoordStr)) {
                        pathAdjacencyCoords.add(adjCoordStr);
                    }
                }
            }
        }
    });

    return { mainPathCoords, pathAdjacencyCoords };
  }, [submapDimensions, simpleHash, currentWorldBiomeId, parentWorldMapCoords]); // playerSubmapCoordsForPath removed

  return { simpleHash, activeSeededFeatures, pathDetails };
}

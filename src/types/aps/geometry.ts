export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface Vector2D {
  u: number;
  v: number;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface OBJVertex extends Vector3D {}

export interface OBJFace {
  vertices: number[]; // Indices into vertices array
  normals?: number[]; // Indices into normals array
  uvs?: number[]; // Indices into uvs array
}

export interface OBJGeometry {
  vertices: OBJVertex[];
  normals: Vector3D[];
  uvs: Vector2D[];
  faces: OBJFace[];
}

export interface BoundingBox {
  min: Vector3D;
  max: Vector3D;
  dimensions: Vector3D;
}

export interface GeometryStats {
  vertexCount: number;
  faceCount: number;
  normalCount: number;
  uvCount: number;
}

export interface GeometryData {
  geometry: OBJGeometry;
  stats: GeometryStats;
  boundingBox: BoundingBox;
}

export interface GeometryResponse {
  success: boolean;
  data: {
    manifest: unknown;
    objInfo: unknown;
    geometryData: {
      stats: {
        vertexCount: number;
        faceCount: number;
        normalCount: number;
        uvCount: number;
      };
      boundingBox: {
        min: { x: number; y: number; z: number };
        max: { x: number; y: number; z: number };
        dimensions: { x: number; y: number; z: number };
      };
    };
  };
  error?: string;
}

import type {
  OBJGeometry,
  Vector3D,
  BoundingBox,
  OBJFace,
} from "@/types/aps/geometry";

export function parseOBJContent(objContent: string): OBJGeometry {
  const geometry: OBJGeometry = {
    vertices: [],
    normals: [],
    uvs: [],
    faces: [],
  };

  const lines = objContent.split("\n");

  for (const line of lines) {
    const tokens = line.trim().split(/\s+/);
    if (tokens.length === 0) continue;

    const [type, ...values] = tokens;

    switch (type) {
      case "v": // Vertex
        if (values.length >= 3) {
          geometry.vertices.push({
            x: parseFloat(values[0] ?? "0"),
            y: parseFloat(values[1] ?? "0"),
            z: parseFloat(values[2] ?? "0"),
          });
        }
        break;

      case "vn": // Normal
        if (values.length >= 3) {
          geometry.normals.push({
            x: parseFloat(values[0] ?? "0"),
            y: parseFloat(values[1] ?? "0"),
            z: parseFloat(values[2] ?? "0"),
          });
        }
        break;

      case "vt": // Texture coordinate
        if (values.length >= 2) {
          geometry.uvs.push({
            u: parseFloat(values[0] ?? "0"),
            v: parseFloat(values[1] ?? "0"),
          });
        }
        break;

      case "f": // Face
        if (values.length >= 3) {
          const face: OBJFace = {
            vertices: [] as number[],
            normals: [] as number[],
            uvs: [] as number[],
          };

          // Process each vertex of the face
          for (const value of values) {
            const [vertexIndex, uvIndex, normalIndex] = value
              .split("/")
              .map((v) => (v ? parseInt(v) - 1 : undefined));

            if (typeof vertexIndex === "number") {
              face.vertices.push(vertexIndex);
              if (typeof uvIndex === "number" && face.uvs) {
                face.uvs.push(uvIndex);
              }
              if (typeof normalIndex === "number" && face.normals) {
                face.normals.push(normalIndex);
              }
            }
          }

          geometry.faces.push(face);
        }
        break;
    }
  }

  return geometry;
}

export function calculateBoundingBox(vertices: Vector3D[]): BoundingBox | null {
  if (vertices.length === 0) {
    return null;
  }

  const bounds = {
    min: { x: Infinity, y: Infinity, z: Infinity },
    max: { x: -Infinity, y: -Infinity, z: -Infinity },
  };

  for (const vertex of vertices) {
    bounds.min.x = Math.min(bounds.min.x, vertex.x);
    bounds.min.y = Math.min(bounds.min.y, vertex.y);
    bounds.min.z = Math.min(bounds.min.z, vertex.z);
    bounds.max.x = Math.max(bounds.max.x, vertex.x);
    bounds.max.y = Math.max(bounds.max.y, vertex.y);
    bounds.max.z = Math.max(bounds.max.z, vertex.z);
  }

  return {
    ...bounds,
    dimensions: {
      x: bounds.max.x - bounds.min.x,
      y: bounds.max.y - bounds.min.y,
      z: bounds.max.z - bounds.min.z,
    },
  };
}

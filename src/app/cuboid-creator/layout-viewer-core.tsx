"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { ModelViewer } from "@/components/viewers/ModelViewer";
import type { CuboidLayout } from "@/lib/quote-price/mold/layout/types";
import type { ThreeGeometry } from "@/lib/occt";

interface LayoutViewerCoreProps {
  layout: CuboidLayout[];
  moldDimensions: {
    width: number;
    depth: number;
    height: number;
  };
  className?: string;
}

export function LayoutViewerCore({
  layout,
  moldDimensions,
  className,
}: LayoutViewerCoreProps) {
  console.log("LayoutViewerCore received props:", { layout, moldDimensions });

  const geometry = useMemo<ThreeGeometry>(() => {
    console.log("Generating geometry for:", {
      numCuboids: layout.length,
      moldDimensions,
    });

    // Create merged geometry data
    const positions: number[] = [];
    const indices: number[] = [];
    const normals: number[] = [];

    // Create mold boundary box geometry with adjusted height
    const moldVertices = [
      [0, 0, 0],
      [moldDimensions.width, 0, 0],
      [moldDimensions.width, moldDimensions.depth, 0],
      [0, moldDimensions.depth, 0],
      [0, 0, moldDimensions.height],
      [moldDimensions.width, 0, moldDimensions.height],
      [moldDimensions.width, moldDimensions.depth, moldDimensions.height],
      [0, moldDimensions.depth, moldDimensions.height],
    ];

    // Add mold boundary vertices
    moldVertices.forEach((vertex) => {
      positions.push(...vertex);
    });

    // Add mold boundary faces
    const moldFaces = [
      // Bottom face
      [0, 1, 2, 0, 2, 3],
      // Top face
      [4, 6, 5, 4, 7, 6],
      // Front face
      [0, 4, 1, 1, 4, 5],
      // Back face
      [2, 6, 3, 3, 6, 7],
      // Left face
      [0, 3, 4, 3, 7, 4],
      // Right face
      [1, 5, 2, 2, 5, 6],
    ];

    moldFaces.forEach((face) => {
      face.forEach((vertexIndex) => {
        indices.push(vertexIndex);
      });
    });

    // Add mold boundary normals
    const moldNormals = [
      [0, 0, -1], // Bottom
      [0, 0, 1], // Top
      [0, -1, 0], // Front
      [0, 1, 0], // Back
      [-1, 0, 0], // Left
      [1, 0, 0], // Right
    ];

    moldNormals.forEach((normal) => {
      for (let i = 0; i < 6; i++) {
        normals.push(...normal);
      }
    });

    // Calculate cuboid vertex offset
    const moldVertexCount = moldVertices.length;

    // Adjust z position to be positive
    layout.forEach((cuboid, cuboidIndex) => {
      const { width, depth, height } = cuboid.dimensions;
      const { x, y, z } = cuboid.position;

      // Adjust z to be positive
      const adjustedZ = Math.abs(z);

      console.log(`Processing cuboid ${cuboidIndex}:`, {
        dimensions: { width, depth, height },
        position: { x, y, adjustedZ },
      });

      // 8 vertices of the cuboid
      const vertices = [
        // Bottom face
        [x, y, adjustedZ],
        [x + width, y, adjustedZ],
        [x + width, y + depth, adjustedZ],
        [x, y + depth, adjustedZ],
        // Top face
        [x, y, adjustedZ + height],
        [x + width, y, adjustedZ + height],
        [x + width, y + depth, adjustedZ + height],
        [x, y + depth, adjustedZ + height],
      ];

      // Add vertices for each cuboid
      vertices.forEach((vertex) => {
        positions.push(...vertex);
      });

      // Calculate vertex offset for current cuboid
      const offset = moldVertexCount + cuboidIndex * 8;

      // Add 6 faces (2 triangles each) of the cuboid
      const faces = [
        // Bottom face
        [0, 1, 2, 0, 2, 3],
        // Top face
        [4, 6, 5, 4, 7, 6],
        // Front face
        [0, 4, 1, 1, 4, 5],
        // Back face
        [2, 6, 3, 3, 6, 7],
        // Left face
        [0, 3, 4, 3, 7, 4],
        // Right face
        [1, 5, 2, 2, 5, 6],
      ];

      faces.forEach((face) => {
        face.forEach((vertexIndex) => {
          indices.push(vertexIndex + offset);
        });
      });

      // Add normals
      const faceNormals = [
        [0, 0, -1], // Bottom
        [0, 0, 1], // Top
        [0, -1, 0], // Front
        [0, 1, 0], // Back
        [-1, 0, 0], // Left
        [1, 0, 0], // Right
      ];

      faceNormals.forEach((normal) => {
        // 6 vertices per face (2 triangles)
        for (let i = 0; i < 6; i++) {
          normals.push(...normal);
        }
      });
    });

    const finalGeometry = {
      positions: new Float32Array(positions),
      indices: new Uint32Array(indices),
      normals: new Float32Array(normals),
    };

    console.log("Generated geometry:", {
      positionsLength: finalGeometry.positions.length,
      indicesLength: finalGeometry.indices.length,
      normalsLength: finalGeometry.normals.length,
    });

    return finalGeometry;
  }, [layout, moldDimensions]);

  return (
    <ModelViewer
      geometry={geometry}
      className={className}
      options={{
        cameraPosition: { x: 500, y: 500, z: 500 },
        cameraTarget: { x: 110, y: 110, z: 205 },
        material: {
          color: 0x44aa88,
          transparent: true,
          opacity: 0.8,
          metalness: 0.1,
          roughness: 0.5,
          depthWrite: false,
          side: THREE.DoubleSide,
        },
      }}
    />
  );
}

import type { GeometricProperties } from "./occt-utils";
import { analyzeMeshGeometry } from "./occt-utils";

interface OCCTResult {
  success: boolean;
  root: {
    name: string;
    meshes: number[];
    children: Array<{
      name: string;
      meshes: number[];
      children: any[];
    }>;
  };
  meshes: Array<{
    name: string;
    attributes: {
      position: {
        array: number[];
      };
    };
    index: {
      array: number[];
    };
    color?: [number, number, number];
    brep_faces: Array<{
      first: number;
      last: number;
      color: [number, number, number] | null;
    }>;
  }>;
}

class OCCTService {
  private static instance: OCCTService;
  private occtModule: any = null;
  private occtInstance: any = null;
  private isInitializing = false;
  private initPromise: Promise<void> | null = null;

  private constructor() {
    // Private constructor to enforce singleton
  }

  public static getInstance(): OCCTService {
    if (!OCCTService.instance) {
      OCCTService.instance = new OCCTService();
    }
    return OCCTService.instance;
  }

  private async initialize(): Promise<void> {
    if (this.occtInstance) return;

    if (this.isInitializing) {
      return this.initPromise;
    }

    this.isInitializing = true;

    try {
      // 仅在客户端环境下导入
      if (typeof window !== "undefined") {
        this.occtModule = require("occt-import-js");
        this.occtInstance = await this.occtModule({
          locateFile: (path: string) => {
            if (path.endsWith(".wasm")) {
              return "/node_modules/occt-import-js/dist/occt-import-js.wasm";
            }
            return path;
          },
        });
      }
    } catch (error) {
      console.error("Failed to initialize OCCT:", error);
      throw error;
    } finally {
      this.isInitializing = false;
    }
  }

  public async processSTEPFile(
    fileBuffer: Uint8Array,
    options = {
      linearDeflection: 0.1,
      angularDeflection: 0.5,
    },
  ): Promise<{
    modelData: OCCTResult;
    geometryData: GeometricProperties;
  }> {
    await this.initialize();

    if (!this.occtInstance) {
      throw new Error("OCCT not initialized");
    }

    const result = await this.occtInstance.ReadStepFile(fileBuffer, options);

    if (!result.success) {
      throw new Error("Failed to process STEP file");
    }

    // 计算几何数据
    const positions = result.meshes[0].attributes.position.array;
    const indices = result.meshes[0].index.array;
    const geometryData = analyzeMeshGeometry(positions, indices);

    return {
      modelData: result,
      geometryData,
    };
  }

  public async processBREPFile(
    fileBuffer: Uint8Array,
    options = {
      linearDeflection: 0.1,
      angularDeflection: 0.5,
    },
  ): Promise<{
    modelData: OCCTResult;
    geometryData: GeometricProperties;
  }> {
    await this.initialize();

    if (!this.occtInstance) {
      throw new Error("OCCT not initialized");
    }

    const result = await this.occtInstance.ReadBrepFile(fileBuffer, options);

    if (!result.success) {
      throw new Error("Failed to process BREP file");
    }

    const positions = result.meshes[0].attributes.position.array;
    const indices = result.meshes[0].index.array;
    const geometryData = analyzeMeshGeometry(positions, indices);

    return {
      modelData: result,
      geometryData,
    };
  }

  public async processIGESFile(
    fileBuffer: Uint8Array,
    options = {
      linearDeflection: 0.1,
      angularDeflection: 0.5,
    },
  ): Promise<{
    modelData: OCCTResult;
    geometryData: GeometricProperties;
  }> {
    await this.initialize();

    if (!this.occtInstance) {
      throw new Error("OCCT not initialized");
    }

    const result = await this.occtInstance.ReadIgesFile(fileBuffer, options);

    if (!result.success) {
      throw new Error("Failed to process IGES file");
    }

    const positions = result.meshes[0].attributes.position.array;
    const indices = result.meshes[0].index.array;
    const geometryData = analyzeMeshGeometry(positions, indices);

    return {
      modelData: result,
      geometryData,
    };
  }
}

export { OCCTService };
export type { OCCTResult, GeometricProperties };

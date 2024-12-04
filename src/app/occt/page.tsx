"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  analyzeMeshGeometry,
  type GeometricProperties,
} from "@/lib/occt-utils";

// 由于occt-import-js是CommonJS模块，我们需要在这里直接导入
let occtModule: typeof import("occt-import-js") | null = null;
let occtInstance: typeof import("occt-import-js").default | null = null;

if (typeof window !== "undefined") {
  // 仅在客户端环境下导入
  occtModule = require("occt-import-js");
}

export default function OCCTPage() {
  const [modelData, setModelData] = useState<any>(null);
  const [geometryData, setGeometryData] = useState<GeometricProperties | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const form = useForm({
    defaultValues: {
      file: undefined,
    },
  });

  useEffect(() => {
    // 初始化OCCT
    const initOCCT = async () => {
      try {
        if (!occtModule) {
          throw new Error("Failed to load OCCT module");
        }

        // 初始化实例
        occtInstance = await occtModule({
          // 指定WASM文件的位置
          locateFile: (path: string) => {
            if (path.endsWith(".wasm")) {
              return "/node_modules/occt-import-js/dist/occt-import-js.wasm";
            }
            return path;
          },
        });
        console.log("OCCT initialized successfully");
      } catch (err) {
        console.error("Failed to initialize OCCT:", err);
        setError("Failed to initialize OCCT viewer");
      }
    };

    void initOCCT();
  }, []);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setModelData(null);
    setGeometryData(null);

    try {
      if (!occtInstance) {
        occtInstance = await occtModule({
          locateFile: (path: string) => {
            if (path.endsWith(".wasm")) {
              return "/node_modules/occt-import-js/dist/occt-import-js.wasm";
            }
            return path;
          },
        });
      }

      const arrayBuffer = await file.arrayBuffer();
      const result = await occtInstance.ReadStepFile(
        new Uint8Array(arrayBuffer),
        {
          linearDeflection: 0.1,
          angularDeflection: 0.5,
        },
      );

      if (result.success) {
        setModelData(result);

        if (result.meshes && result.meshes.length > 0) {
          const positions = result.meshes[0].attributes.position.array;
          const indices = result.meshes[0].index.array;
          const geometry = analyzeMeshGeometry(positions, indices);
          setGeometryData(geometry);
        }
      } else {
        setError("Failed to load STEP file");
      }
    } catch (err) {
      console.error("Error processing file:", err);
      setError(err instanceof Error ? err.message : "Failed to process file");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-6 text-2xl font-bold">3D模型分析</h1>

      {error && (
        <div className="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      {geometryData && (
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>基本尺寸</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-muted-foreground">
                    宽度
                  </dt>
                  <dd className="text-sm font-semibold">
                    {geometryData.boundingBox.dimensions.x.toFixed(2)} mm
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-muted-foreground">
                    高度
                  </dt>
                  <dd className="text-sm font-semibold">
                    {geometryData.boundingBox.dimensions.y.toFixed(2)} mm
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-muted-foreground">
                    深度
                  </dt>
                  <dd className="text-sm font-semibold">
                    {geometryData.boundingBox.dimensions.z.toFixed(2)} mm
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-muted-foreground">
                    对角线长度
                  </dt>
                  <dd className="text-sm font-semibold">
                    {Math.sqrt(
                      Math.pow(geometryData.boundingBox.dimensions.x, 2) +
                        Math.pow(geometryData.boundingBox.dimensions.y, 2) +
                        Math.pow(geometryData.boundingBox.dimensions.z, 2),
                    ).toFixed(2)}{" "}
                    mm
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-muted-foreground">
                    体积
                  </dt>
                  <dd className="text-sm font-semibold">
                    {geometryData.meshStats.volume.toFixed(2)} mm³
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>网格统计</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-muted-foreground">
                    表面积
                  </dt>
                  <dd className="text-sm font-semibold">
                    {geometryData.meshStats.surfaceArea.toFixed(2)} mm²
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-muted-foreground">
                    顶点数量
                  </dt>
                  <dd className="text-sm font-semibold">
                    {geometryData.meshStats.vertexCount}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-muted-foreground">
                    三角形数量
                  </dt>
                  <dd className="text-sm font-semibold">
                    {geometryData.meshStats.triangleCount}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-muted-foreground">
                    网格密度
                  </dt>
                  <dd className="text-sm font-semibold">
                    {geometryData.meshStats.density.toFixed(4)} 三角形/mm³
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>网格质量</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-muted-foreground">
                    最小三角形面积
                  </dt>
                  <dd className="text-sm font-semibold">
                    {geometryData.meshStats.minTriangleArea.toFixed(2)} mm²
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-muted-foreground">
                    最大三角形面积
                  </dt>
                  <dd className="text-sm font-semibold">
                    {geometryData.meshStats.maxTriangleArea.toFixed(2)} mm²
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-muted-foreground">
                    平均三角形面积
                  </dt>
                  <dd className="text-sm font-semibold">
                    {geometryData.meshStats.averageTriangleArea.toFixed(2)} mm²
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-muted-foreground">
                    纵横比
                  </dt>
                  <dd className="text-sm font-semibold">
                    {geometryData.meshStats.meshQuality.aspectRatio.toFixed(2)}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>角度分析</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-muted-foreground">
                    最小角度
                  </dt>
                  <dd className="text-sm font-semibold">
                    {geometryData.meshStats.meshQuality.minAngle.toFixed(1)}°
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-muted-foreground">
                    最大角度
                  </dt>
                  <dd className="text-sm font-semibold">
                    {geometryData.meshStats.meshQuality.maxAngle.toFixed(1)}°
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-muted-foreground">
                    平均角度
                  </dt>
                  <dd className="text-sm font-semibold">
                    {geometryData.meshStats.meshQuality.averageAngle.toFixed(1)}
                    °
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>拓扑特征</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-muted-foreground">
                    面数量
                  </dt>
                  <dd className="text-sm font-semibold">
                    {geometryData.topologyInfo.faceCount}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-muted-foreground">
                    边数量
                  </dt>
                  <dd className="text-sm font-semibold">
                    {geometryData.topologyInfo.edgeCount}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-muted-foreground">
                    亏格数
                  </dt>
                  <dd className="text-sm font-semibold">
                    {geometryData.topologyInfo.genus}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-muted-foreground">
                    欧拉特征数
                  </dt>
                  <dd className="text-sm font-semibold">
                    {geometryData.topologyInfo.eulerCharacteristic}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>曲率分析</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-2">
                <div className="space-y-1">
                  <dt className="text-sm font-medium text-muted-foreground">
                    高斯曲率
                  </dt>
                  <dd className="rounded bg-muted p-2 font-mono text-sm">
                    最小值:{" "}
                    {geometryData.curvatureAnalysis.gaussianCurvature.min.toFixed(
                      3,
                    )}
                    <br />
                    最大值:{" "}
                    {geometryData.curvatureAnalysis.gaussianCurvature.max.toFixed(
                      3,
                    )}
                    <br />
                    平均值:{" "}
                    {geometryData.curvatureAnalysis.gaussianCurvature.average.toFixed(
                      3,
                    )}
                  </dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-sm font-medium text-muted-foreground">
                    平均曲率
                  </dt>
                  <dd className="rounded bg-muted p-2 font-mono text-sm">
                    最小值:{" "}
                    {geometryData.curvatureAnalysis.meanCurvature.min.toFixed(
                      3,
                    )}
                    <br />
                    最大值:{" "}
                    {geometryData.curvatureAnalysis.meanCurvature.max.toFixed(
                      3,
                    )}
                    <br />
                    平均值:{" "}
                    {geometryData.curvatureAnalysis.meanCurvature.average.toFixed(
                      3,
                    )}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>对称性分析</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-muted-foreground">
                    XY平面对称
                  </dt>
                  <dd className="text-sm font-semibold">
                    {geometryData.symmetry.hasXYSymmetry ? "是" : "否"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-muted-foreground">
                    YZ平面对称
                  </dt>
                  <dd className="text-sm font-semibold">
                    {geometryData.symmetry.hasYZSymmetry ? "是" : "否"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-muted-foreground">
                    XZ平面对称
                  </dt>
                  <dd className="text-sm font-semibold">
                    {geometryData.symmetry.hasXZSymmetry ? "是" : "否"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-muted-foreground">
                    对称性得分
                  </dt>
                  <dd className="text-sm font-semibold">
                    {(geometryData.symmetry.symmetryScore * 100).toFixed(1)}%
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>惯性特性</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-2">
                <div className="space-y-1">
                  <dt className="text-sm font-medium text-muted-foreground">
                    主惯性矩
                  </dt>
                  <dd className="rounded bg-muted p-2 font-mono text-sm">
                    Ixx: {geometryData.inertia.principalMoments.x.toFixed(2)}
                    <br />
                    Iyy: {geometryData.inertia.principalMoments.y.toFixed(2)}
                    <br />
                    Izz: {geometryData.inertia.principalMoments.z.toFixed(2)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-muted-foreground">
                    回转半径
                  </dt>
                  <dd className="text-sm font-semibold">
                    {geometryData.inertia.gyrationRadius.toFixed(2)} mm
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="space-y-4">
        <input
          type="file"
          accept=".step,.stp"
          onChange={handleFileChange}
          className="block w-full text-sm text-slate-500 file:mr-4 file:rounded-full file:border-0 file:bg-violet-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-violet-700 hover:file:bg-violet-100"
          disabled={loading}
        />
        {loading && <div className="text-center">加载中...</div>}
        {modelData && (
          <div id="viewer" style={{ width: "100%", height: "500px" }} />
        )}
      </div>
    </div>
  );
}

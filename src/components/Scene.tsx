"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { CSG } from 'three-csg-ts';
import {
  calculate3DCenter,
  calculateDimensions,
  createLayoutItemWithHeight,
  toThreeJSCoordinates,
} from "@/lib/utils/coordinate";
import {
  type Product,
} from "@/types/domain/product";
import {
  type Rectangle,
} from "@/types/core/geometry";

const MOLD_MARGIN = 50; // 模具边距（毫米）
const MOLD_HEIGHT_MARGIN = 10; // 模具上下边距（毫米）
const CAVITY_MARGIN = 0.2; // 凹槽边距（毫米）

interface SceneProps {
  product?: Product;
  products?: Product[];
  layout?: Rectangle[];
}

/**
 * 3D场景组件
 */
export const Scene: React.FC<SceneProps> = ({ product, products, layout }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameId = useRef<number | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // 清理之前的 WebGL 上下文
    const existingCanvas = containerRef.current.querySelector("canvas");
    if (existingCanvas) {
      containerRef.current.removeChild(existingCanvas);
    }

    // 确保数据有效性
    const isSingleProduct = !!product?.dimensions;
    const isMultiProduct = products && layout?.length === products?.length;
    if (!isSingleProduct && !isMultiProduct) {
      return;
    }

    // 检查布局数据
    if (isMultiProduct && (!layout || !products || layout.length !== products.length)) {
      return;
    }

    // 创建场景
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    // 环境光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    // 主光源 - 从右上方照射
    const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
    mainLight.position.set(5, 8, 5);
    scene.add(mainLight);

    // 辅助光源1 - 从左前方照射
    const fillLight1 = new THREE.DirectionalLight(0xffffff, 0.4);
    fillLight1.position.set(-3, 6, 2);
    scene.add(fillLight1);

    // 辅助光源2 - 从后方照射
    const fillLight2 = new THREE.DirectionalLight(0xffffff, 0.3);
    fillLight2.position.set(0, 4, -5);
    scene.add(fillLight2);

    // 底部柔光 - 增加底部细节可见度
    const bottomLight = new THREE.DirectionalLight(0xffffff, 0.2);
    bottomLight.position.set(0, -5, 0);
    scene.add(bottomLight);

    // 创建相机
    const camera = new THREE.PerspectiveCamera(
      50,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000,
    );

    // 计算场景尺寸和边界
    let totalWidth = 0;
    let totalLength = 0;
    let maxHeight = 0;

    if (isMultiProduct && layout && products) {
      // 计算布局的总体尺寸
      const minX = Math.min(...layout.map(item => item.x));
      const maxX = Math.max(...layout.map(item => item.x + item.width));
      const minY = Math.min(...layout.map(item => item.y));
      const maxY = Math.max(...layout.map(item => item.y + item.length));
      
      totalWidth = maxX - minX;
      totalLength = maxY - minY;
      maxHeight = Math.max(...products.map(p => p.dimensions?.height ?? 0));

      // 创建模具盒子
      const moldWidth = totalWidth + MOLD_MARGIN * 2;
      const moldLength = totalLength + MOLD_MARGIN * 2;
      const moldHeight = maxHeight + MOLD_HEIGHT_MARGIN * 2;

      const moldGeometry = new THREE.BoxGeometry(
        moldWidth / 100,
        moldHeight / 100,
        moldLength / 100
      );
      const moldMaterial = new THREE.MeshPhongMaterial({
        color: 0x505050,
        opacity: 0.75,  // 降低透明度使凹槽更明显
        transparent: true,
        side: THREE.DoubleSide,
        shininess: 90,  // 增加反光度
        specular: 0x888888,  // 增加高光强度
        flatShading: false,  // 平滑着色
      });
      let moldMesh: THREE.Mesh<THREE.BufferGeometry, THREE.Material> = new THREE.Mesh(moldGeometry, moldMaterial);
      moldMesh.position.set(0, moldHeight / 200, 0); // 模具中心

      // 渲染产品
      layout.forEach((item, index) => {
        const product = products[index];
        if (!product?.dimensions) return;

        // 创建带高度的布局项
        const layoutItem = createLayoutItemWithHeight(item, product.dimensions.height);
        
        // 计算中心点和尺寸
        const center = calculate3DCenter(layoutItem);
        const dimensions = calculateDimensions(layoutItem);
        
        // 转换为Three.js坐标，但高度需要特殊处理
        const position = toThreeJSCoordinates({
          x: center.x,
          y: dimensions.height / 2, // 从底部开始算起
          z: center.z,
        });

        // 创建凹槽（稍大一点）
        const cavityGeometry = new THREE.BoxGeometry(
          (dimensions.width + CAVITY_MARGIN * 2) / 100,
          dimensions.height / 100,
          (dimensions.length + CAVITY_MARGIN * 2) / 100
        );
        const cavityMesh = new THREE.Mesh(cavityGeometry);
        cavityMesh.position.copy(new THREE.Vector3(position.x, position.y, position.z));

        // 从模具中减去凹槽
        try {
          const moldCSG = CSG.fromMesh(moldMesh);
          const cavityCSG = CSG.fromMesh(cavityMesh);
          const resultCSG = moldCSG.subtract(cavityCSG);
          const newMoldMesh = CSG.toMesh(
            resultCSG,
            moldMesh.matrix,
            new THREE.MeshPhongMaterial({
              color: 0x505050,
              opacity: 0.75,  // 降低透明度
              transparent: true,
              side: THREE.DoubleSide,
              shininess: 90,  // 增加反光度
              specular: 0x888888,  // 增加高光强度
              flatShading: false,  // 平滑着色
            })
          );
          
          // 保持原始模具的位置和属性
          newMoldMesh.position.copy(moldMesh.position);
          moldMesh = newMoldMesh;
        } catch (error) {
          console.error('Error creating cavity:', error);
        }

        // 添加中心点标记
        const sphereGeometry = new THREE.SphereGeometry(0.015);
        const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xff3333 });
        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        sphere.position.set(position.x, 0.015, position.z);
        scene.add(sphere);
      });

      scene.add(moldMesh);

      // 添加模具边框线
      const edges = new THREE.EdgesGeometry(moldGeometry);
      const lineMaterial = new THREE.LineBasicMaterial({ 
        color: 0x404040,
        linewidth: 1,
      });
      const moldWireframe = new THREE.LineSegments(edges, lineMaterial);
      moldWireframe.position.copy(moldMesh.position);
      scene.add(moldWireframe);

      // 添加网格辅助线在原点
      const gridHelper = new THREE.GridHelper(10, 10, 0xcccccc, 0xe5e5e5);
      gridHelper.position.y = -0.01; // 略微下移网格，避免z-fighting
      scene.add(gridHelper);

    } else if (isSingleProduct && product.dimensions) {
      totalWidth = product.dimensions.width;
      totalLength = product.dimensions.length;
      maxHeight = product.dimensions.height;

      // 创建模具盒子
      const moldWidth = totalWidth + MOLD_MARGIN * 2;
      const moldLength = totalLength + MOLD_MARGIN * 2;
      const moldHeight = maxHeight + MOLD_HEIGHT_MARGIN * 2;

      const moldGeometry = new THREE.BoxGeometry(
        moldWidth / 100,
        moldHeight / 100,
        moldLength / 100
      );
      const moldMaterial = new THREE.MeshPhongMaterial({
        color: 0x505050,
        opacity: 0.75,  // 降低透明度使凹槽更明显
        transparent: true,
        side: THREE.DoubleSide,
        shininess: 90,  // 增加反光度
        specular: 0x888888,  // 增加高光强度
        flatShading: false,  // 平滑着色
      });
      let moldMesh: THREE.Mesh<THREE.BufferGeometry, THREE.Material> = new THREE.Mesh(moldGeometry, moldMaterial);
      moldMesh.position.set(0, moldHeight / 200, 0); // 模具中心

      // 渲染单个产品
      const layoutItem = createLayoutItemWithHeight({ x: 0, y: 0, width: product.dimensions.width, length: product.dimensions.length }, product.dimensions.height);
      const center = calculate3DCenter(layoutItem);
      const dimensions = calculateDimensions(layoutItem);
      
      // 转换为Three.js坐标
      const position = toThreeJSCoordinates({
        x: center.x,
        y: dimensions.height / 2,
        z: center.z,
      });

      // 创建凹槽（稍大一点）
      const cavityGeometry = new THREE.BoxGeometry(
        (dimensions.width + CAVITY_MARGIN * 2) / 100,
        dimensions.height / 100,
        (dimensions.length + CAVITY_MARGIN * 2) / 100
      );
      const cavityMesh = new THREE.Mesh(cavityGeometry);
      cavityMesh.position.copy(new THREE.Vector3(position.x, position.y, position.z));

      // 从模具中减去凹槽
      try {
        const moldCSG = CSG.fromMesh(moldMesh);
        const cavityCSG = CSG.fromMesh(cavityMesh);
        const resultCSG = moldCSG.subtract(cavityCSG);
        const newMoldMesh = CSG.toMesh(
          resultCSG,
          moldMesh.matrix,
          new THREE.MeshPhongMaterial({
            color: 0x505050,
            opacity: 0.75,  // 降低透明度
            transparent: true,
            side: THREE.DoubleSide,
            shininess: 90,  // 增加反光度
            specular: 0x888888,  // 增加高光强度
            flatShading: false,  // 平滑着色
          })
        );
        
        // 保持原始模具的位置和属性
        newMoldMesh.position.copy(moldMesh.position);
        moldMesh = newMoldMesh;
      } catch (error) {
        console.error('Error creating cavity:', error);
      }

      scene.add(moldMesh);

      // 添加模具边框线
      const edges = new THREE.EdgesGeometry(moldGeometry);
      const lineMaterial = new THREE.LineBasicMaterial({ 
        color: 0x404040,
        linewidth: 1,
      });
      const moldWireframe = new THREE.LineSegments(edges, lineMaterial);
      moldWireframe.position.copy(moldMesh.position);
      scene.add(moldWireframe);

      // 添加网格辅助线在原点
      const gridHelper = new THREE.GridHelper(10, 10, 0xcccccc, 0xe5e5e5);
      gridHelper.position.y = -0.01; // 略微下移网格，避免z-fighting
      scene.add(gridHelper);

      // 添加中心点标记
      const sphereGeometry = new THREE.SphereGeometry(0.015);
      const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xff3333 });
      const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
      sphere.position.set(position.x, 0.015, position.z);
      scene.add(sphere);
    }

    // 调整相机位置以适应场景大小
    const sceneSize = Math.max(
      (totalWidth + MOLD_MARGIN * 2) / 100,
      (totalLength + MOLD_MARGIN * 2) / 100
    );
    const cameraDistance = Math.max(sceneSize * 2, 5);
    camera.position.set(cameraDistance, cameraDistance, cameraDistance);
    camera.lookAt(0, 0, 0);

    // 创建渲染器
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(
      containerRef.current.clientWidth,
      containerRef.current.clientHeight,
    );
    renderer.shadowMap.enabled = true;
    containerRef.current.appendChild(renderer.domElement);

    // 添加轨道控制器
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // 渲染循环
    function animate() {
      animationFrameId.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    // 处理窗口大小变化
    function handleResize() {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }

    // 保存当前的 container 引用
    const currentContainer = containerRef.current;
    window.addEventListener("resize", handleResize);

    // 清理函数
    return () => {
      // 停止动画循环
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }

      // 移除事件监听器
      window.removeEventListener("resize", handleResize);

      // 清理 WebGL 上下文
      if (currentContainer) {
        const canvas = currentContainer.querySelector("canvas");
        if (canvas) {
          currentContainer.removeChild(canvas);
        }
      }

      // 释放 Three.js 资源
      renderer.dispose();
      scene.clear();
    };
  }, [product, products, layout]);

  return <div ref={containerRef} className="h-full w-full" />;
};

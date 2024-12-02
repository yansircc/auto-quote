"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import {
  calculate3DCenter,
  calculateDimensions,
  toThreeJSCoordinates,
  type LayoutItemWithHeight,
} from "@/lib/utils/coordinate";
import { type Product } from "@/types/domain/product";
import { type Rectangle } from "@/types/core/geometry";

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
    scene.background = new THREE.Color("#f1f5f9");

    // 创建相机
    const camera = new THREE.PerspectiveCamera(
      50,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000,
    );

    let totalWidth = 0;
    let totalHeight = 0;

    // 调整相机位置以适应场景大小
    if (isMultiProduct && layout) {
      totalWidth = Math.max(...layout.map((item) => item.x + item.width)) / 100;
      totalHeight = Math.max(...layout.map((item) => item.y + item.length)) / 100;
    } else if (isSingleProduct && product.dimensions) {
      totalWidth = product.dimensions.width / 100;
      totalHeight = product.dimensions.length / 100;
    }

    const cameraDistance = Math.max(Math.max(totalWidth, totalHeight) * 2, 5);
    camera.position.set(cameraDistance, cameraDistance, cameraDistance);

    // 创建渲染器
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(
      containerRef.current.clientWidth,
      containerRef.current.clientHeight,
    );
    renderer.shadowMap.enabled = true;
    containerRef.current.appendChild(renderer.domElement);

    // 添加网格辅助线
    const gridHelper = new THREE.GridHelper(10, 10, "#cccccc", "#e5e5e5");
    
    if (isMultiProduct && products && layout) {
      const layoutWithHeight = layout.map((item, index) => ({
        ...item,
        height: products[index]?.dimensions?.height ?? 10, // 默认高度为10
      })) as LayoutItemWithHeight[];

      // 计算布局的几何中心
      const bounds = {
        minX: Math.min(...layout.map(r => r.x)),
        maxX: Math.max(...layout.map(r => r.x + r.width)),
        minZ: Math.min(...layout.map(r => r.y)),
        maxZ: Math.max(...layout.map(r => r.y + r.length)),
      };
      
      const geometricCenter = {
        x: (bounds.minX + bounds.maxX) / 2,
        y: 0,
        z: (bounds.minZ + bounds.maxZ) / 2,
      };
      const threeGeometricCenter = toThreeJSCoordinates(geometricCenter);

      // 移动网格辅助线到几何中心点
      gridHelper.position.set(threeGeometricCenter.x, 0, threeGeometricCenter.z);
      scene.add(gridHelper);

      // 创建产品模型
      layoutWithHeight.forEach((item) => {
        const center = calculate3DCenter(item);
        const dimensions = calculateDimensions(item);
        const threePosition = toThreeJSCoordinates(center);

        const geometry = new THREE.BoxGeometry(
          dimensions.width * 0.01,
          dimensions.height * 0.01,
          dimensions.length * 0.01
        );
        const material = new THREE.MeshStandardMaterial({
          color: "#3b82f6",
          transparent: true,
          opacity: 0.8,
        });
        const mesh = new THREE.Mesh(geometry, material);

        mesh.position.set(threePosition.x, threePosition.y, threePosition.z);

        scene.add(mesh);

        // 添加中心点标记
        const sphereGeometry = new THREE.SphereGeometry(0.02);
        const sphereMaterial = new THREE.MeshBasicMaterial({ color: "#ef4444" });
        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        sphere.position.set(threePosition.x, 0, threePosition.z);
        scene.add(sphere);
      });
    } else if (isSingleProduct && product.dimensions) {
      // 添加网格辅助线到原点
      scene.add(gridHelper);
      
      // 创建单个产品的3D表示
      const geometry = new THREE.BoxGeometry(
        product.dimensions.width / 100,
        product.dimensions.height / 100,
        product.dimensions.length / 100,
      );
      const material = new THREE.MeshStandardMaterial({
        color: "#3b82f6",
        transparent: true,
        opacity: 0.8,
      });
      const mesh = new THREE.Mesh(geometry, material);

      // 设置位置在原点
      mesh.position.set(0, product.dimensions.height / 200, 0);

      scene.add(mesh);

      // 添加中心点标记
      const sphereGeometry = new THREE.SphereGeometry(0.02);
      const sphereMaterial = new THREE.MeshBasicMaterial({ color: "#ef4444" });
      const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
      sphere.position.set(0, 0, 0);
      scene.add(sphere);
    }

    // 添加光源
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

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

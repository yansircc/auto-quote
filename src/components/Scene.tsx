'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { type Point3D, type Rectangle, type Product, convertTo3D } from '@/types/geometry';

// 创建参考线
function createReferenceLine(
  start: THREE.Vector3,
  end: THREE.Vector3,
  color: string
): THREE.Line {
  const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
  const material = new THREE.LineBasicMaterial({ color });
  return new THREE.Line(geometry, material);
}

interface SceneProps {
  product?: Product;
  products?: Product[];
  layout?: Rectangle[];
}

/**
 * 3D场景组件
 */
export function Scene({ product, products, layout }: SceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  let animationFrameId: number | null = null;

  useEffect(() => {
    if (!containerRef.current) return;
    
    // 清理之前的 WebGL 上下文
    const existingCanvas = containerRef.current.querySelector('canvas');
    if (existingCanvas) {
      containerRef.current.removeChild(existingCanvas);
    }
    
    // 确保数据有效性
    const isSingleProduct = !!product?.dimensions;
    const isMultiProduct = products?.length > 0 && layout?.length === products?.length;
    if (!isSingleProduct && !isMultiProduct) {
      return;
    }

    // 检查布局数据
    if (!layout || !products || layout.length !== products.length) {
      return;
    }

    // 创建场景
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#f1f5f9');

    // 创建相机
    const camera = new THREE.PerspectiveCamera(
      50,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );

    let totalWidth = 0;
    let totalHeight = 0;

    // 调整相机位置以适应场景大小
    if (isMultiProduct) {
      totalWidth = Math.max(...layout.map(item => item.x + item.width)) / 100;
      totalHeight = Math.max(...layout.map(item => item.y + item.height)) / 100;
    }
    const cameraDistance = Math.max(
      isMultiProduct ? Math.max(totalWidth, totalHeight) * 2 : 5,
      5
    );
    camera.position.set(cameraDistance, cameraDistance, cameraDistance);

    // 创建渲染器
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    containerRef.current.appendChild(renderer.domElement);

    // 添加网格辅助线
    const gridHelper = new THREE.GridHelper(10, 10, '#cccccc', '#e5e5e5');
    scene.add(gridHelper);

    // 渲染产品
    products.forEach((product, index) => {
      const layoutItem = layout[index];
      if (!layoutItem || !product.dimensions) {
        return;
      }

      // 直接使用2D布局数据，只添加高度
      const size: Point3D = {
        x: layoutItem.width / 100,
        y: product.dimensions.height / 100,
        z: layoutItem.height / 100
      };

      // 位置也直接使用2D布局坐标
      const position = {
        x: layoutItem.x / 100,
        y: size.y / 2,
        z: layoutItem.y / 100
      };

      // 创建产品几何体
      const geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
      const material = new THREE.MeshPhysicalMaterial({
        color: `hsl(${(index * 360) / products.length}, 70%, 60%)`,
        metalness: 0.2,
        roughness: 0.4,
        transparent: true,
        opacity: 0.9,
        side: THREE.DoubleSide
      });

      const cube = new THREE.Mesh(geometry, material);
      
      // 设置产品位置
      cube.position.set(
        position.x + size.x / 2,
        position.y,
        position.z + size.z / 2
      );

      cube.castShadow = true;
      cube.receiveShadow = true;
      scene.add(cube);

      // 添加线框
      const wireframeGeometry = new THREE.BoxGeometry(size.x, size.y, size.z);
      const wireframeMaterial = new THREE.LineBasicMaterial({ 
        color: '#94a3b8',
        transparent: true,
        opacity: 0.5
      });
      const wireframe = new THREE.LineSegments(
        new THREE.WireframeGeometry(wireframeGeometry),
        wireframeMaterial
      );
      wireframe.position.copy(cube.position);
      scene.add(wireframe);
    });

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
      animationFrameId = requestAnimationFrame(animate);
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
    window.addEventListener('resize', handleResize);

    // 清理函数
    return () => {
      // 停止动画循环
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      
      // 释放资源
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (object.material instanceof THREE.Material) {
            object.material.dispose();
          } else if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          }
        }
      });
      
      // 销毁渲染器
      renderer.dispose();
      
      // 移除 canvas
      if (containerRef.current?.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement);
      }
      
      window.removeEventListener('resize', handleResize);
    };
  }, [product, products, layout]);

  return <div ref={containerRef} className="w-full h-full" />;
}

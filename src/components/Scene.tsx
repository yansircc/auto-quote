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

  useEffect(() => {
    if (!containerRef.current) return;
    
    // 确保数据有效性
    const isSingleProduct = !!product?.dimensions;
    const isMultiProduct = products?.length > 0 && layout?.length === products?.length;
    if (!isSingleProduct && !isMultiProduct) {
      console.warn('Scene: Invalid data', {
        isSingleProduct,
        isMultiProduct,
        hasProduct: !!product,
        productsLength: products?.length,
        layoutLength: layout?.length
      });
      return;
    }

    // Debug logs
    console.log('Scene render:', {
      mode: isSingleProduct ? 'single' : 'multi',
      productsCount: products?.length,
      layoutCount: layout?.length,
      product: product ? { 
        id: product.id,
        dimensions: product.dimensions
      } : null,
      layout: layout?.map(l => ({ 
        x: l.x, 
        y: l.y, 
        width: l.width, 
        height: l.height,
        rotated: l.rotated,
        originalIndex: l.originalIndex
      })),
      products: products?.map(p => ({
        id: p.id,
        dimensions: p.dimensions
      }))
    });

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

    // 创建产品模型
    if (product) {
      // 单个产品视图
      if (!product.dimensions) return;
      
      const size: Point3D = { 
        x: product.dimensions.length / 100,
        y: product.dimensions.height / 100,
        z: product.dimensions.width / 100
      };
      
      const geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
      const material = new THREE.MeshPhysicalMaterial({
        color: '#64748b',
        metalness: 0.2,
        roughness: 0.4,
        transparent: true,
        opacity: 0.9,
        side: THREE.DoubleSide
      });
      
      const cube = new THREE.Mesh(geometry, material);
      cube.position.set(
        size.x / 2, // 将产品中心放在原点
        size.y / 2, // 放在地面上
        -size.z / 2 // Z轴需要取反以保持一致性
      );
      cube.castShadow = true;
      cube.receiveShadow = true;
      scene.add(cube);

      // 添加参考线
      const lineColor = '#666666';
      
      scene.add(createReferenceLine(
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(size.x, 0, 0),
        lineColor
      ));
      
      scene.add(createReferenceLine(
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, -size.z),
        lineColor
      ));
      
      scene.add(createReferenceLine(
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, size.y, 0),
        lineColor
      ));
    } else if (products && layout) {
      // 多个产品布局视图
      console.log('Layout dimensions:', { totalWidth, totalHeight });
      
      products.forEach((product, index) => {
        const layoutItem = layout[index];
        if (!layoutItem || !product.dimensions) {
          console.warn('Missing data for product', { 
            productId: product.id, 
            hasLayout: !!layoutItem,
            hasDimensions: !!product.dimensions 
          });
          return;
        }

        // 计算3D尺寸
        const size: Point3D = {
          x: layoutItem.rotated ? product.dimensions.width / 100 : product.dimensions.length / 100,
          y: product.dimensions.height / 100,
          z: layoutItem.rotated ? product.dimensions.length / 100 : product.dimensions.width / 100
        };

        console.log(`Product #${index}:`, {
          productId: product.id,
          dimensions: product.dimensions,
          layout: layoutItem,
          size,
          position: convertTo3D(layoutItem, size.y / 2)
        });

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
        
        // Convert from 2D layout coordinates to 3D scene coordinates
        const position = convertTo3D(layoutItem, size.y / 2);
        cube.position.set(
          position.x / 100 + size.x / 2 - totalWidth / 2,  // Center X
          position.y,                                       // Place on ground
          -position.z / 100 - size.z / 2 + totalHeight / 2 // Center Z and flip
        );

        cube.castShadow = true;
        cube.receiveShadow = true;
        scene.add(cube);

        // Add debug wireframe
        const wireframe = new THREE.LineSegments(
          new THREE.EdgesGeometry(geometry),
          new THREE.LineBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.2 })
        );
        wireframe.position.copy(cube.position);
        scene.add(wireframe);
      });
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
      requestAnimationFrame(animate);
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
      window.removeEventListener('resize', handleResize);
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (object.material instanceof THREE.Material) {
            object.material.dispose();
          }
        }
      });
    };
  }, [product, products, layout]);

  return <div ref={containerRef} className="w-full h-full" />;
}

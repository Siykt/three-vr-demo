import { useEffect, useRef, useState } from 'react';
import './App.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import VRTestImage from './assets/vr-test.jpg';

function App() {
  const ref = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const controlsRef = useRef<OrbitControls>();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const clearerHandles: (() => void)[] = [];
    // const ratio = window.devicePixelRatio;
    const width = window.innerWidth;
    const height = window.innerHeight;

    // 场景
    if (!sceneRef.current) {
      sceneRef.current = new THREE.Scene();
    }
    const scene = sceneRef.current;
    scene.background = new THREE.Color(0xffffff);

    // 透视相机
    if (!cameraRef.current) {
      cameraRef.current = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    }
    const camera = cameraRef.current;
    // 初始化相机位置
    camera.position.set(0, 0, 100);
    camera.lookAt(sceneRef.current.position);

    // 渲染器
    if (!rendererRef.current) {
      rendererRef.current = new THREE.WebGLRenderer({
        // 抗锯齿
        antialias: true,
      });
    }
    const renderer = rendererRef.current;
    // 初始化渲染器
    renderer.setSize(width, height);
    el.appendChild(renderer.domElement);

    // 控制器
    if (!controlsRef.current) {
      controlsRef.current = new OrbitControls(camera, renderer.domElement);
    }
    const controls = controlsRef.current;

    // 启用惯性
    controls.enableDamping = true;
    // 相机向外移动极限
    controls.maxDistance = 4.5;

    const loader = new THREE.TextureLoader();
    // 使用球体材质展示vr全景图
    const sg = new THREE.SphereGeometry(5, 32, 32);
    const renderVRGeometry = async () => {
      const texture = await loader.loadAsync(VRTestImage);
      const material = new THREE.MeshBasicMaterial({ map: texture });
      const sphere = new THREE.Mesh(sg, material);
      sphere.geometry.scale(window.devicePixelRatio, window.devicePixelRatio, -1);
      scene.add(sphere);
      clearerHandles.push(() => scene.remove(sphere));
      controls.update();
    };
    renderVRGeometry();

    // 渲染动画
    let raf = -1;
    const render = () => {
      renderer.render(scene, camera);
      raf = requestAnimationFrame(render);
    };
    render();
    return () => {
      el.removeChild(renderer.domElement);
      cancelAnimationFrame(raf);
      clearerHandles.forEach(Reflect.apply);
    };
  }, []);

  return <div ref={ref} className="App"></div>;
}

export default App;

// import React, { useState, useEffect } from "react";
// import { Canvas } from "@react-three/fiber";
// import { OrbitControls } from "@react-three/drei";
// import * as THREE from "three";
// import { parseDxfFile } from "./dfx-utils";
// import { useThree } from "@react-three/fiber";
// import "./App.css";

// function computeBoundingBoxAndCenter(group: any) {
//   const box = new THREE.Box3().setFromObject(group);
//   const size = new THREE.Vector3();
//   box.getSize(size);

//   const center = new THREE.Vector3();
//   box.getCenter(center);

//   return { box, size, center };
// }

// function DxfModel({ dxfData }: any) {
//   const [object3D, setObject3D] = useState(null);
//   const { camera } = useThree(); // Add this line

//   useEffect(() => {
//     if (dxfData) {
//       const newObj = parseDxfFile(dxfData);
//       // @ts-ignore
//       setObject3D(newObj);

//       // Compute the bounding box and center, and adjust the camera
//       const { box, size, center } = computeBoundingBoxAndCenter(newObj);
//       console.log(box, size, center);
//       const maxSize = Math.max(size.x, size.y, size.z);

//       camera.position.copy(center).add(new THREE.Vector3(0, 0, maxSize * 1.5));
//       camera.zoom = 1;
//       camera.updateProjectionMatrix();
//     }
//   }, [dxfData, camera]);

//   return object3D ? <primitive object={object3D} /> : null;
// }

// function App() {
//   const [dxfData, setDxfData] = useState(null);
//   const [cameraConfig, setCameraConfig] = useState({
//     position: new THREE.Vector3(0, 0, 10),
//     zoom: 1,
//   });

//   const handleFileUpload = (event: any) => {
//     const file = event.target.files[0];
//     if (file) {
//       const reader = new FileReader();
//       //@ts-ignore
//       reader.onload = (e) => setDxfData(e?.target?.result);
//       reader.readAsText(file);
//     }
//   };
//   const handleFit = () => {
//     // Implement fit to view functionality
//   };

//   const handlePan = () => {
//     // Implement pan functionality
//   };

//   const handleZoom = () => {
//     // Implement zoom functionality
//   };

//   const handleOrbit = () => {
//     // Implement orbit functionality
//   };

//   return (
//     <div className="App">
//       <input type="file" onChange={handleFileUpload} />
//       <Canvas
//         style={{
//           width: "100%",
//           height: "100%",
//           position: "absolute",
//           backgroundColor: "#000000",
//         }}
//       >
//         <ambientLight intensity={0.6} />
//         <pointLight position={[10, 10, 10]} />
//         <DxfModel dxfData={dxfData} setCameraConfig={setCameraConfig} />
//         <OrbitControls />
//       </Canvas>
//       <div className="controls">
//         <div className="button" onClick={handleFit}>
//           Fit
//         </div>
//         <div className="button" onClick={handlePan}>
//           Pan
//         </div>
//         <div className="button" onClick={handleZoom}>
//           Zoom
//         </div>
//         <div className="button" onClick={handleOrbit}>
//           Orbit
//         </div>
//       </div>
//     </div>
//   );
// }

// export default App;

// import React, { useState, useEffect } from "react";
// import { Canvas } from "@react-three/fiber";
// import { OrbitControls } from "@react-three/drei";
// import * as THREE from "three";
// import { parseDxfFile } from "./dfx-utils";
// import { useThree } from "@react-three/fiber";
// import "./App.css";

// export function computeBoundingBoxAndCenter(group: any) {
//   const box = new THREE.Box3().setFromObject(group);
//   const size = new THREE.Vector3();
//   box.getSize(size);

//   const center = new THREE.Vector3();
//   box.getCenter(center);

//   return { box, size, center };
// }

// function DxfModel({ dxfData }: any) {
//   const [object3D, setObject3D] = useState(null);
//   const { camera } = useThree(); // Add this line

//   useEffect(() => {
//     if (dxfData) {
//       const newObj = parseDxfFile(dxfData);
//       //@ts-ignore
//       setObject3D(newObj);

//       // Compute the bounding box and center, and adjust the camera
//       const { box, size, center } = computeBoundingBoxAndCenter(newObj);
//       const maxSize = Math.max(size.x, size.y, size.z);
//       const scaledCenter = center.clone().multiplyScalar(0.4);

//       camera.position
//         .copy(scaledCenter)
//         .add(new THREE.Vector3(0, 0, maxSize * 1.5));
//       camera.zoom = 1;
//       camera.updateProjectionMatrix();
//       console.log(camera.position);
//     }
//   }, [dxfData, camera]);

//   // useEffect(() => {
//   //   if (dxfData) {
//   //     const newObj = parseDxfFile(dxfData);
//   //     // @ts-ignore
//   //     setObject3D(newObj);
//   //   }
//   // }, [dxfData]);

//   // useEffect(() => {
//   //   if (object3D) {
//   //     console.log(object3D);
//   //     // Compute the bounding box and center, and adjust the camera
//   //     const { box, size, center } = computeBoundingBoxAndCenter(object3D);
//   //     const maxSize = Math.max(size.x, size.y, size.z);
//   //     console.log(size, center);
//   //     // camera.position.copy(center).add(new THREE.Vector3(0, 0, maxSize * 1.5));
//   //     // camera.lookAt(center);
//   //     // camera.updateProjectionMatrix();
//   //     camera.position.z = maxSize * 1.5; // Adjust this multiplier as needed
//   //     camera.position.add(center);

//   //     // Adjust camera's far clipping plane so that it's large enough to include the entire scene
//   //     // camera.far = maxSize * 3; // Adjust this multiplier as needed
//   //     camera.updateProjectionMatrix();

//   //     // Look at the center of the bounding box
//   //     camera.lookAt(center);

//   //     console.log(camera.position);
//   //   }
//   // }, [object3D, camera]);

//   return object3D ? <primitive object={object3D} /> : null;
// }

// function App() {
//   const [dxfData, setDxfData] = useState(null);

//   const handleFileUpload = (event: any) => {
//     const file = event.target.files[0];
//     if (file) {
//       const reader = new FileReader();
//       //@ts-ignore
//       reader.onload = (e) => setDxfData(e?.target?.result);
//       reader.readAsText(file);
//     }
//   };

//   return (
//     <div className="App">
//       <input type="file" onChange={handleFileUpload} />
//       <Canvas
//         style={{
//           width: "100%",
//           height: "100%",
//           position: "absolute",
//           backgroundColor: "#c4c4c4",
//         }}
//       >
//         {/* <ambientLight intensity={0.6} />
//         <pointLight position={[10, 10, 10]} />
//         <directionalLight color="red" position={[10, 10, 10]} /> */}
//         {/* <directionalLight
//           color={"red"}
//           intensity={0.5}
//           position={[0, 20, 0]}
//           shadow-radius={5}
//           castShadow
//         ></directionalLight> */}
//         <DxfModel dxfData={dxfData} />
//         <OrbitControls />
//       </Canvas>
//     </div>
//   );
// }

// export default App;

import React, { useState, useEffect, useRef } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  PerspectiveCamera,
  useTexture,
  Environment,
} from "@react-three/drei";
import * as THREE from "three";
import { parseDxfFile } from "./dfx-utils";
import "./App.css";

export function computeBoundingBoxAndCenter(group: any) {
  const box = new THREE.Box3().setFromObject(group);
  const size = new THREE.Vector3();
  box.getSize(size);

  const center = new THREE.Vector3();
  box.getCenter(center);

  return { box, size, center };
}

function DxfModel({ dxfData }: any) {
  const [object3D, setObject3D] = useState(null);
  const { camera } = useThree();

  useEffect(() => {
    if (dxfData) {
      const newObj = parseDxfFile(dxfData);
      //@ts-ignore
      setObject3D(newObj);

      const { box, size, center } = computeBoundingBoxAndCenter(newObj);
      const maxSize = Math.max(size.x, size.y, size.z);

      camera.position.copy(center).add(new THREE.Vector3(0, 0, maxSize * 2.5)); // Increase the multiplier
      camera.far = maxSize * 5; // Adjust the camera's far plane
      camera.near = 0.1; // Adjust the camera's near plane
      camera.updateProjectionMatrix();
      console.log(camera.position, box, center, size);
    }
  }, [dxfData, camera]);

  return object3D ? <primitive object={object3D} /> : null;
}

function App() {
  const [dxfData, setDxfData] = useState(null);

  const handleFileUpload = (event: any) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => setDxfData(e?.target?.result);
      reader.readAsText(file);
    }
  };

  function Box({ position, color }: any) {
    const ref: any = useRef();
    // useFrame(
    //   //@ts-ignore
    //   () => (ref?.current?.rotation?.x = ref.current.rotation.y += 0.01)
    // );

    return (
      <mesh position={position} ref={ref}>
        <boxBufferGeometry args={[1, 1, 1]} attach="geometry" />
        <meshStandardMaterial color={color} attach="material" />
      </mesh>
    );
  }

  return (
    <div className="App">
      <input type="file" onChange={handleFileUpload} />
      <Canvas style={{ width: "100%", height: "100%", position: "absolute" }}>
        <ambientLight color="#ffffff" intensity={0.7} />
        <directionalLight
          position={[2.5, 8, 5]}
          intensity={1.0}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-camera-far={50}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
        />
        <pointLight position={[10, 10, 10]} intensity={0.6} />
        <DxfModel dxfData={dxfData} />
        {/* <Box color="#18a36e" position={[-1, 0, 3]} />
        <Box color="#f56f42" position={[1, 0, 3]} /> */}
        {/* <gridHelper args={[100, 100]} /> */}
        <OrbitControls />
        {/* <Environment preset="sunset" background /> */}
      </Canvas>
    </div>
  );
}

export default App;

// import "@babylonjs/core/Debug/debugLayer";
// import "@babylonjs/inspector";
// import "@babylonjs/loaders/glTF";
// import { Engine, Scene, ArcRotateCamera, Vector3, HemisphericLight, Mesh, MeshBuilder } from "@babylonjs/core";

// class App {
//   constructor() {
//       // create the canvas html element and attach it to the webpage
//       var canvas = document.createElement("canvas");
//       canvas.style.width = "100%";
//       canvas.style.height = "100%";
//       canvas.id = "gameCanvas";
//       document.body.appendChild(canvas);

//       // initialize babylon scene and engine
//       var engine = new Engine(canvas, true);
//       var scene = new Scene(engine);

//       var camera: ArcRotateCamera = new ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2, 2, Vector3.Zero(), scene);
//       camera.attachControl(canvas, true);
//       var light1: HemisphericLight = new HemisphericLight("light1", new Vector3(1, 1, 0), scene);
//       var sphere: Mesh = MeshBuilder.CreateSphere("sphere", { diameter: 1 }, scene);

//       // hide/show the Inspector
//       window.addEventListener("keydown", (ev) => {
//           // Shift+Ctrl+Alt+I
//           if (ev.shiftKey && ev.ctrlKey && ev.altKey && ev.keyCode === 73) {
//               if (scene.debugLayer.isVisible()) {
//                   scene.debugLayer.hide();
//               } else {
//                   scene.debugLayer.show();
//               }
//           }
//       });

//       // run the main render loop
//       engine.runRenderLoop(() => {
//           scene.render();
//       });
//   }
// }
// new App();
import './App.css';

import React, { ReactNode, Ref, useRef, useState } from "react";
import {
  Engine,
  Scene,
  useBeforeRender,
  useClick,
  useHover
} from "react-babylonjs";

import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Color3 } from "@babylonjs/core/Maths/math.color";

const DefaultScale = new Vector3(1, 1, 1);
const BiggerScale = new Vector3(1.25, 1.25, 1.25);

type SpinningBoxProps = {
  name: string;
  position: Vector3;
  hoveredColor: Color3;
  color: Color3;
    
};
  

const SpinningBox = (props: SpinningBoxProps) => {
  // access Babylon scene objects with same React hook as regular DOM elements
  const boxRef = useRef<Mesh>(null);

  const [clicked, setClicked] = useState(false);
  useClick(() => setClicked((clicked) => !clicked), boxRef);

  const [hovered, setHovered] = useState(false);
  useHover(
    () => setHovered(true),
    () => setHovered(false),
    boxRef
  );

  // This will rotate the box on every Babylon frame.
  const rpm = 5;
  useBeforeRender((scene) => {
    if (boxRef.current) {
      // Delta time smoothes the animation.
      var deltaTimeInMillis = scene.getEngine().getDeltaTime();
      boxRef.current.rotation.y +=
        (rpm / 60) * Math.PI * 2 * (deltaTimeInMillis / 1000);
    }
  });

  return (
    <box
      name={props.name}
      // ref={boxRef}
      size={2}
      position={props.position}
      scaling={clicked ? BiggerScale : DefaultScale}
    >
      <standardMaterial
        name={`${props.name}-mat`}
        diffuseColor={hovered ? props.hoveredColor : props.color}
        specularColor={Color3.Black()}
      />
    </box>
  );
};

export const SceneWithSpinningBoxes = () => (
  <div>
    <Engine antialias adaptToDeviceRatio canvasId="babylon-canvas">
      <Scene>
        <arcRotateCamera
          name="camera1"
          target={Vector3.Zero()}
          alpha={Math.PI / 2}
          beta={Math.PI / 4}
          radius={8}
        />
        <hemisphericLight
          name="light1"
          intensity={0.7}
          direction={Vector3.Up()}
        />
        <SpinningBox
          name="left"
          position={new Vector3(-2, 0, 0)}
          color={Color3.FromHexString("#EEB5EB")}
          // color={Color3.FromHexString("red")}
          hoveredColor={Color3.FromHexString("#C26DBC")}    />
        <SpinningBox
          name="right"
          position={new Vector3(2, 0, 0)}
          color={Color3.FromHexString("#C8F4F9")}
          hoveredColor={Color3.FromHexString("#3CACAE")}    />
      </Scene>
    </Engine>
  </div>
);

export default function App() {
  return (
    <div className="App">
      <h1>Hello CodeSandbox</h1>
      <h2>Start editing to see some magic happen!</h2>
      <SceneWithSpinningBoxes />
    
    </div>
  );
}

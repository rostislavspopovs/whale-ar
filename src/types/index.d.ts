import type {InteractionManager} from "three.interactive";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { LoadingManager } from "three";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader.js";
import {CSS3DRenderer} from "three/examples/jsm/renderers/CSS3DRenderer";
import type {ARController} from "jsartoolkit5";

export {};

declare global {
    interface Window {
        arController: ARController;
        loadingManager: LoadingManager;
        gltfLoader: GLTFLoader;
        whaleXML: any; // whatever type you want to give. (any,number,float etc)
        interactionManager: InteractionManager;
        orbitControls: OrbitControls;
        camera: THREE.PerspectiveCamera;
        debugControls: THREE.TransformControls;
        cssRenderer: THREE.CSS3DRenderer;
    }
}
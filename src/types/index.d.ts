import type {InteractionManager} from "three.interactive";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { LoadingManager } from "three";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader.js";
import {CSS2DRenderer} from "three/examples/jsm/renderers/CSS2DRenderer";
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
        cssRenderer: THREE.CSS2DRenderer;
        debugControls: THREE.TransformControls;
    }
}
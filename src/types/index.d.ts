import type {InteractionManager} from "three.interactive";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { LoadingManager } from "three";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader.js";

export {};

declare global {
    interface Window {
        loadingManager: LoadingManager;
        gltfLoader: GLTFLoader;
        whaleXML: any; // whatever type you want to give. (any,number,float etc)
        interactionManager: InteractionManager;
        orbitControls: OrbitControls;
        camera: THREE.PerspectiveCamera;
    }
}
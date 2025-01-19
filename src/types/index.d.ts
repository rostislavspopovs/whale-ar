import type {InteractionManager} from "three.interactive";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export {};

declare global {
    interface Window {
        whaleXML: any; // whatever type you want to give. (any,number,float etc)
        interactionManager: InteractionManager;
        orbitControls: OrbitControls;
    }
}
import type {InteractionManager} from "three.interactive";

export {};

declare global {
    interface Window {
        whaleXML: any; // whatever type you want to give. (any,number,float etc)
        interactionManager: InteractionManager;
    }
}
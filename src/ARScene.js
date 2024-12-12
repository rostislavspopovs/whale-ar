import {BoxGeometry, Group, Mesh, MeshBasicMaterial, TextureLoader} from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

export class ARScene {

    constructor(render) {

        this.container = new Group();

        let gltfLoader = new GLTFLoader();
        gltfLoader.load("../src/assets/earth-lowpoly.glb", (earth) => {
            this.container.add(earth.scene);
        }, undefined, function ( error ) {

            console.error( error );

        } );

        this.container.scale.set(100, 100, 100);
        //this.container.position.set(200, 150, -170);
    }

    get group(){
        return this.container;
    }

}
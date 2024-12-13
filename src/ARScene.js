import {BoxGeometry, Group, LoadingManager, Mesh, MeshBasicMaterial, Object3D, TextureLoader} from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

export class ARScene {

    constructor() {

        this.loadingManager = new LoadingManager();

        this.arScene = new Group();

        let whale1mesh = new Object3D();
        let whale2mesh = new Object3D();
        let whale3mesh = new Object3D();

        let whales = new Group();
        let whaleCount;
        let whaleCircleRadius = 50;

        this.loadingManager.onProgress = function ( url, itemsLoaded, itemsTotal ) {
            console.log(`Item loaded: ${url}`)
        }

        this.loadingManager.onLoad = function ( ) {
            console.log(`All Items Loaded`);
            whales.add(whale1mesh.clone());
            whales.add(whale2mesh.clone());
            whales.add(whale3mesh.clone());
            whales.add(whale1mesh.clone());
            whales.add(whale2mesh.clone());
            whales.add(whale3mesh.clone());

            whaleCount = whales.children.length;
            whalesDistributeOnCircle(whales, whaleCircleRadius);
        }

        let gltfLoader = new GLTFLoader(this.loadingManager);
        gltfLoader.load("../src/assets/earth-lowpoly.glb", (earth) => {
            this.arScene.add(earth.scene);
        }, undefined, function ( error ) {
            console.error( error );
        } );

        gltfLoader.load("../src/assets/whale1.glb", (whale1) => {
            whale1mesh = whale1.scene;
        }, undefined, function ( error ) {console.error( error );} );

        gltfLoader.load("../src/assets/whale2.glb", (whale2) => {
            whale2mesh = whale2.scene;
        }, undefined, function ( error ) {console.error( error );} );

        gltfLoader.load("../src/assets/whale3.glb", (whale3) => {
            whale3mesh = whale3.scene;
        }, undefined, function ( error ) {console.error( error );} );

        whales.scale.set(0.02,0.02,0.02);

        this.arScene.add(whales);

        this.arScene.scale.set(100, 100, 100);
        this.arScene.position.set(200, 150, -170);
    }

    get group(){
        return this.arScene;
    }
}

// @ts-ignore
function whalesDistributeOnCircle(whales, radius){
    let n = whales.children.length;
    console.log("whale count: " + n.toString());
    for (let i=0; i<n; ++i) {

        let angle = i * ( 2 * Math.PI / n );

        let x = ( radius ) * Math.cos( angle );
        let z = ( radius ) * Math.sin( angle );

        whales.children[i].position.set(x,0,z);
        whales.children[i].rotation.set(0,-2*Math.PI * i/6,0);
        console.log("whale " + i.toString() + " at " + whales.children[i].position.toString());
    }
}
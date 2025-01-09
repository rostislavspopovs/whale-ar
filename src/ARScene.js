import {BoxGeometry, Clock, Color, Group, LoadingManager, Mesh, MeshBasicMaterial, Object3D, TextureLoader} from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { InteractionManager } from 'three.interactive';

let deltaTime = 0
let totalTime = 0;
let clock = new Clock();

let whale1prefab = new Object3D();
let whale2prefab = new Object3D();
let whale3prefab = new Object3D();

let earthObject = new Object3D();

let whales = new Group();
let whaleCount;
let whaleCircleRadius = 50;

let selectedWhale;

let camera;

let interactionManager;

let whaleData;

export class ARScene {

    constructor(_renderer, _camera) {

        camera = _camera;
        this.loadingManager = new LoadingManager();

        interactionManager = new InteractionManager(_renderer, _camera, _renderer.domElement);

        this.arScene = new Group();

        this.loadingManager.onProgress = function ( url, itemsLoaded, itemsTotal ) {
            console.log(`Item loaded: ${url}`)
        }

        function instatiateWhale(prefab, id){
            let whale = prefab.clone();
            whale.name = id;
            whales.add(whale);
        }

        this.loadingManager.onLoad = function ( ) {
            console.log(`All Items Loaded`);
            whales.name = "Whales";
            instatiateWhale(whale1prefab, "spermWhale");
            instatiateWhale(whale2prefab, "humpbackWhale");
            instatiateWhale(whale3prefab, "blueWhale");
            instatiateWhale(whale1prefab, "orcaWhale");
            instatiateWhale(whale2prefab, "belugaWhale");
            instatiateWhale(whale3prefab, "bowheadWhale");
            instatiateWhale(whale1prefab, "pilotWhale");
            instatiateWhale(whale2prefab, "finWhale");

            whaleCount = whales.children.length;
            whalesDistributeOnCircle(whales, whaleCircleRadius);
            setupWhaleInteraction(whales);

            update();
        }

        let gltfLoader = new GLTFLoader(this.loadingManager);
        gltfLoader.load("../src/assets/earth-lowpoly.glb", (earth) => {
            earthObject = earth.scene;
            this.arScene.add(earthObject);
        }, undefined, function ( error ) {
            console.error( error );
        } );

        gltfLoader.load("../src/assets/whale1.glb", (whale1) => {
            whale1prefab = whale1.scene;
            whale1prefab.name = "whale1";
        }, undefined, function ( error ) {console.error( error );} );

        gltfLoader.load("../src/assets/whale2.glb", (whale2) => {
            whale2prefab = whale2.scene;
            whale2prefab.name = "whale2";
        }, undefined, function ( error ) {console.error( error );} );

        gltfLoader.load("../src/assets/whale3.glb", (whale3) => {
            whale3prefab = whale3.scene;
            whale3prefab.name = "whale3";
        }, undefined, function ( error ) {console.error( error );} );

        whales.scale.set(0.02,0.02,0.02);

        this.arScene.add(whales);

        //this.arScene.scale.set(75, 75, 75);
        //this.arScene.position.set(200, 150, -170);

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
        whales.children[i].rotation.set(0,Math.PI-(2*Math.PI * i/n),Math.PI/3);
    }
}

function setupWhaleInteraction(whales){
    let n = whales.children.length;
    for (let i=0; i<n; ++i) {
        interactionManager.add(whales.children[i]);
        whales.children[i].addEventListener('click', (event) => {
            setSelectedWhale(event.target);
        });
    }
}

function setSelectedWhale(whale){
    if(selectedWhale != null ){
        selectedWhale.scale.set(1,1,1);
        document.dispatchEvent(new CustomEvent('whaleUnselected'));
        if (selectedWhale.name === whale.name){
            console.log("same whale unselected")
            selectedWhale = null;
            return;
        }
    }

    selectedWhale = whale;
    selectedWhale.scale.set(2,2,2);
    document.dispatchEvent(new CustomEvent('whaleSelected', {detail: { 'id': selectedWhale.name}}));
}

function update(){
    requestAnimationFrame(update);
    interactionManager.update();

    deltaTime = clock.getDelta();
    totalTime += deltaTime;

    earthObject.rotation.set(0,totalTime/7,0)

    //whales.rotation.set(0,totalTime/5,0);
    whales.lookAt(camera.position);
    whales.rotateX(Math.PI/2)
    whales.rotateY(totalTime/6);
}
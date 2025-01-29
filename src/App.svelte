<script>
    import {
        Color,
        Group,
        ImageUtils,
        MeshPhongMaterial,
        MeshStandardMaterial,
        TextureLoader,
        Vector2,
        Vector3
    } from "three";
    import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
    import {Howl} from "howler";
    import {SVGLoader} from "three/examples/jsm/loaders/SVGLoader.js";
    import {CSS2DObject, CSS2DRenderer} from "three/examples/jsm/renderers/CSS2DRenderer.js";
    import {element} from "three/src/Three.TSL.js";
    import {CSS3DObject} from "three/examples/jsm/renderers/CSS3DRenderer.js";


    let {scene} = $props();
    let appLaunched = $state(false);
    let selectedWhaleId = $state();
    let inWhaleSelection = $state(false);
    let whaleSelector;
    let globe;
    let currentIndex;

    let camera;
    let defaultCameraPos;
    let defaultCameraRot;

    let globeMaterial1 = new MeshStandardMaterial();
    let globeMaterial2 = new MeshStandardMaterial();
    let globeMaterial3 = new MeshStandardMaterial();

    let poiLabels;

    let gpsVisible = $state(true);
    let shipVisible = $state(false);

    AFRAME.registerComponent("click-test", {
        init: function () {
            var obj = this.el.object3D;
            window.interactionManager.add(obj);
            var testBox = document.querySelector("#test-box").object3D;
            obj.addEventListener('click', (event) => {

                    const raycaster = new THREE.Raycaster();
                    raycaster.setFromCamera( event.coords, camera );
                    console.log("tap:" + event.coords.x + " " + event.coords.y);
                    const intersects = raycaster.intersectObjects( scene.children );
                    for ( let i = 0; i < intersects.length; i ++ ) {
                        console.log(intersects[ i ].point);
                        poiLabel.position.copy(intersects[ i ].point);
                        testBox.position.copy(intersects[ i ].point);
                    }

            })
        }
    });

    console.log("App Scene");
    export const appInit = (latestScanPatternUrl) => {
        selectedWhaleId = latestScanPatternUrl;
        console.log(selectedWhaleId);
        appLaunched = true;
        window.orbitControls.enabled = true;
        globe = document.querySelector("#globe");
        whaleSelector = document.querySelector("#whale-selector");
        globe.setAttribute("visible", true);

        globeMaterial1 = globe.object3D.children[2].children[0].material;
        globeMaterial2 = globe.object3D.children[2].children[1].material;
        globeMaterial3 = globe.object3D.children[2].children[2].material;
        globe.object3D.children[2].children[2].renderOrder = 1;
        globe.object3D.children[2].children[1].renderOrder = 2;
        //overlayMaterial.copy(globe.object3D.children[0].children[0].material);

        globeMaterial2.map = textureLoader.load("/assets/planet-overlays/shipping-density.png");
        globeMaterial2.color = new Color().setHex(0x0006bd);
        globeMaterial2.alphaTest = 0.0;
        globeMaterial2.blending = THREE.NormalBlending;
        globeMaterial2.transparent = true;
        globeMaterial2.opacity = 0.7;
        globeMaterial2.depthFunc = THREE.AlwaysDepth;
        globeMaterial2.needsUpdate = true;
        globeMaterial2.visible = false;

        poiLabels = new Group();
        scene.add(poiLabels)

        setupGlobeControls();
        AFRAME.ANIME({
            targets: [globe.object3D.position],
            x: 0,
            y: 0,
            z: -6,
            easing: 'easeOutQuart',
            duration: 1500
        });
        AFRAME.ANIME({
            targets: [globe.object3D.scale],
            x: 1,
            y: 1,
            z: 1,
            easing: 'easeOutQuart',
            duration: 1500,
        });
        function setupGlobeControls() {
            console.log(globe.object3D);
            window.orbitControls.target = globe.object3D.position;
            //window.orbitControls.autoRotate = true;
            window.orbitControls.rotateSpeed = 0.5;
            window.orbitControls.enablePan = false
            window.orbitControls.minDistance = 2;
            window.orbitControls.maxDistance = 6;

            camera = window.camera;
            defaultCameraPos = camera.position;
            defaultCameraRot = camera.rotation;
        }
        SetGlobeOverlay();
        //setupPOIs();
    };

    function resetCamera(){
        window.orbitControls.enabled = false;
        camera.position.set(0,0,0);
        window.orbitControls.enabled = true;
    }

    const whaleIds = ['sperm-whale','blue-whale','humpback-whale'];
    function launchWhaleSelectMenu(){
        console.log(selectedWhaleId);
        currentIndex = whaleIds.indexOf(selectedWhaleId);
        console.log("Whale Selector, current id: "+ currentIndex);

        resetCamera()
        globe.setAttribute("visible", false);
        whaleSelector.setAttribute("visible", true);
        globe.object3D.scale.set(0,0,0);
        whaleSelector.object3D.scale.set(0,0,0);
        inWhaleSelection = true;
        showSelectedWhale();

        AFRAME.ANIME({
            targets: [whaleSelector.object3D.scale],
            x: 0.4,
            y: 0.4,
            z: 0.4,
            easing: 'easeOutQuint',
            duration: 750
        });

        window.interactionManager.add(globe.object3D);
    }
    function exitWhaleSelectMenu(){

        resetCamera()
        globe.setAttribute("visible", true);
        whaleSelector.setAttribute("visible", false);
        whaleSelector.object3D.scale.set(0,0,0);
        globe.object3D.scale.set(0,0,0);
        inWhaleSelection = false;

        AFRAME.ANIME({
            targets: [globe.object3D.scale],
            x: 1,
            y: 1,
            z: 1,
            easing: 'easeOutQuint',
            duration: 750
        });

        SetGlobeOverlay();
        //setupPOIs();
    }
    function nextWhale(){

        resetCamera()
        whaleSelector.object3D.scale.set(0,0,0);
        currentIndex = (currentIndex + 1 + whaleIds.length) % whaleIds.length;
        selectedWhaleId = whaleIds[currentIndex];
        showSelectedWhale();
        AFRAME.ANIME({
            targets: [whaleSelector.object3D.scale],
            x: 0.4,
            y: 0.4,
            z: 0.4,
            easing: 'easeOutQuint',
            duration: 500
        });
    }
    function prevWhale(){

        resetCamera()
        whaleSelector.object3D.scale.set(0,0,0);
        currentIndex = (currentIndex - 1 + whaleIds.length) % whaleIds.length;
        selectedWhaleId = whaleIds[currentIndex];
        showSelectedWhale();
        AFRAME.ANIME({
            targets: [whaleSelector.object3D.scale],
            x: 0.4,
            y: 0.4,
            z: 0.4,
            easing: 'easeOutQuint',
            duration: 500
        });
    }

    function showSelectedWhale(){
        whaleIds.forEach((whaleId) => {
            document.getElementById(whaleId).setAttribute("visible", false);
            if(whaleId == selectedWhaleId){
                document.getElementById(whaleId).setAttribute("visible", true);
            }
        })
    }

    function toggleShipOverlay(){
        globeMaterial2.visible = !globeMaterial2.visible;
        shipVisible = !shipVisible;
    }
    function toggleGPSOverlay(){
        globeMaterial3.visible = !globeMaterial3.visible;
        gpsVisible = !gpsVisible;
    }

    const textureLoader = new TextureLoader();
    function SetGlobeOverlay(){

        globeMaterial3.map = textureLoader.load("/assets/planet-overlays/"+window.whaleXML[selectedWhaleId]["satellite"]);
        globeMaterial3.alphaTest = 0.0;
        globeMaterial3.transparent = true;
        globeMaterial3.opacity = 1;
        globeMaterial3.needsUpdate = true;
        console.log(globe.object3D);
    }

    var poiLabel;
    function setupPOIs(){

        var POIs = window.whaleXML[selectedWhaleId]["POIs"];

        for (var i = 0; i < POIs.length; i++){

            var poi = POIs[i];

            var poiDiv = document.createElement( 'div' );
            poiDiv.className = 'poi';
            //poiDiv.style.zIndex = 100;
            poiDiv.textContent = poi["name"];


            poiLabel = new CSS2DObject(poiDiv);
            //poiLabel.position.set( poi["x"], poi["y"], poi["z"] );
            poiLabel.center.x = 0.5;
            poiLabel.center.y = 0.5;
            poiLabel.position.set(0,0,0);
            poiLabel.layers.set( 0 );

            scene.add(poiLabel)

        }


    }
</script>

<a-entity
        id="globe"
        loaded-gltf-model="modelId: earth-model"
        position="0 0 -6"
        scale="0 0 0"
        rotation="0 0 0"
        visible="false">
    <a-entity
            id="anim-boats"
            scale="1 1 1"
            loaded-gltf-model="modelId: boat-models"
            animation-mixer="clip: *">
    </a-entity>
    <a-entity
            id="anim-sperm-whales"
            scale="1 1 1"
            loaded-gltf-model="modelId: sperm-whales"
            animation-mixer="clip: *">
    </a-entity>
</a-entity>

<a-entity id="whale-selector"
          position="0 0 -6"
          scale="0 0 0"
          visible="false">
    <a-entity id="sperm-whale"
              visible="false"
              loaded-gltf-model="modelId: sperm-whale-model"
              animation-mixer
              position="0 0 0"
              scale="0.6 0.6 0.6"
              rotation="0 -90 0"
    >
    </a-entity>
    <a-entity
            id="blue-whale"
            visible="false"
            loaded-gltf-model="modelId: blue-whale-model"
            animation-mixer
            position="0 0 0"
            scale="0.2 0.2 0.2"
            rotation="0 -90 0"
    >
    </a-entity>
    <a-entity
            id="humpback-whale"
            visible="false"
            loaded-gltf-model="modelId: humpback-whale-model"
            animation-mixer
            position="0 -1 0"
            scale="0.2 0.2 0.2"
            rotation="0 -90 0"
    ></a-entity>
</a-entity>

{#if appLaunched}
    {#if !inWhaleSelection}
        <div class="map-options">
            <button class="gps-toggle-button" onclick={toggleGPSOverlay} aria-label="Toggle GPS Tracking Overlay">
                {#if gpsVisible}
                    <svg width="40" height="40">
                        <image xlink:href="/assets/gps-button-1.svg" width="40" height="40"/>
                    </svg>
                {:else}
                    <svg width="40" height="40">
                        <image xlink:href="/assets/gps-button-2.svg" width="40" height="40"/>
                    </svg>
                {/if}
            </button>
            <button class="ship-toggle-button" onclick={toggleShipOverlay} aria-label="Toggle Ship Density Overlay">
                {#if shipVisible}
                    <svg width="40" height="40">
                        <image xlink:href="/assets/ship-button-1.svg" width="40" height="40"/>
                    </svg>
                {:else}
                    <svg width="40" height="40">
                        <image xlink:href="/assets/ship-button-2.svg" width="40" height="40"/>
                    </svg>
                {/if}
            </button>
            {#if gpsVisible}
                <div style="border: 1px solid white">
                    <svg width="100" height="40">
                        <image xlink:href="/assets/gps-key.svg" width="100" height="40"/>
                    </svg>
                    <svg width="100" height="40">
                        <image xlink:href="/assets/corridor-key.svg" width="100" height="40"/>
                    </svg>
                </div>
            {/if}
            {#if shipVisible}
                <div style="border: 1px solid white">
                    <svg width="100" height="40">
                        <image xlink:href="/assets/ship-key.svg" width="100" height="40"/>
                    </svg>
                </div>
            {/if}
        </div>

        <div id="top-text">
                <h1>Selected whale:<br>{window.whaleXML[selectedWhaleId]["name"]}</h1>
        </div>
    {/if}
    <div class="whale-menu">
        {#if !inWhaleSelection}
            <button class="whale-selector-button" onclick={launchWhaleSelectMenu} aria-label="Enter Whale Selector">
                <svg width="90" height="90">
                    <image xlink:href="/assets/whale-selector-button.svg" width="90" height="90"/>
                </svg>
            </button>
        {:else}
            <div style="display: flex; justify-content: center;">
                <button class="whale-selector-left-button" onclick={prevWhale} aria-label="Previous Whale">
                    <svg width="70" height="70">
                        <image xlink:href="/assets/chevron-left-button.svg" width="70" height="70"/>
                    </svg>
                </button>
                <button class="globe-button" onclick={exitWhaleSelectMenu} aria-label="Return to Globe">
                    <svg width="90" height="90">
                        <image xlink:href="/assets/globe-button.svg" width="90" height="90"/>
                    </svg>
                </button>
                <button class="whale-selector-right-button" onclick={nextWhale} aria-label="Next Whale">
                    <svg width="70" height="70">
                        <image xlink:href="/assets/chevron-right-button.svg" width="70" height="70"/>
                    </svg>
                </button>
            </div>
        {/if}
    </div>
    {#if inWhaleSelection}
        <div class="whale-panel">
            <h1><b>Selected whale:</b> {window.whaleXML[selectedWhaleId]["name"]}</h1>
            <h2>
                {window.whaleXML[selectedWhaleId]["status"]}<br>
                <b>Length:</b> {window.whaleXML[selectedWhaleId]["length"]}<br>
                <b>Population:</b> {window.whaleXML[selectedWhaleId]["population"]}
            </h2>
        </div>
    {/if}
{/if}
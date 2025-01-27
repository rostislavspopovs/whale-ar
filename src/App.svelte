<script>
    import {ImageUtils, MeshPhongMaterial, TextureLoader, Vector2, Vector3} from "three";
    import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
    import {Howl} from "howler";

    let appLaunched = $state(false);
    let selectedWhaleId = $state();
    let inWhaleSelection = $state(false);
    let whaleSelector;
    let globe;
    let currentIndex;

    let camera;
    let defaultCameraPos;
    let defaultCameraRot;

    let overlayMaterial = new MeshPhongMaterial();

    console.log("App Scene");
    export const appInit = (latestScanPatternUrl) => {
        selectedWhaleId = latestScanPatternUrl;
        console.log(selectedWhaleId);
        appLaunched = true;
        window.orbitControls.enabled = true;
        globe = document.querySelector("#globe");
        whaleSelector = document.querySelector("#whale-selector");
        globe.setAttribute("visible", true);

        overlayMaterial = globe.object3D.children[0].children[1].material;
        overlayMaterial.copy(globe.object3D.children[0].children[0].material);

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
            window.orbitControls.autoRotate = true;
            window.orbitControls.enablePan = false
            window.orbitControls.minDistance = 2;
            window.orbitControls.maxDistance = 6;

            camera = window.camera;
            defaultCameraPos = camera.position;
            defaultCameraRot = camera.rotation;
        }
        SetGlobeOverlay();
    };

    function resetCamera(){
        window.orbitControls.enabled = false;
        camera.position.set(0,0,0);
        camera.rotation.set(45,0,0);
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
    const textureLoader = new TextureLoader();
    function SetGlobeOverlay(){
        overlayMaterial.map = textureLoader.load("/assets/blue-whale-paths.png");
        overlayMaterial.transparent = true;
        overlayMaterial.needsUpdate = true;
    }
</script>

<a-entity
        id="globe"
        loaded-gltf-model="modelId: earth-model"
        position="0 0 -6"
        scale="0 0 0"
        rotation="0 0 0"
        visible="false">
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
    <div id="top-text">
        {#if !inWhaleSelection}
            <h1>Now tracking:<br>{window.whaleXML[selectedWhaleId]["name"]}</h1>
        {:else}
            <h1>Select whale:<br>{window.whaleXML[selectedWhaleId]["name"]}</h1>
        {/if}
    </div>
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
{/if}
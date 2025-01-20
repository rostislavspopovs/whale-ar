<script>
    import {Vector2, Vector3} from "three";
    import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
    import {Howl} from "howler";

    let appLaunched = $state(false);
    let selectedWhaleId = $state();
    let inWhaleSelection = $state(false);
    let whaleSelector;
    console.log("App Scene");
    export const appInit = (latestScanPatternUrl) => {
        selectedWhaleId = latestScanPatternUrl;
        console.log(selectedWhaleId);
        appLaunched = true;
        window.orbitControls.enabled = true;
        let globe = document.querySelector("#globe");
        whaleSelector = document.querySelector("#whale-selector");
        globe.setAttribute("visible", true);
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
            duration: 1500
        });
        AFRAME.ANIME({
            targets: [globe.object3D.rotation],
            x: 0,
            y: 1,
            z: 0,
            easing: 'easeOutQuart',
            duration: 1500,
            complete: setupGlobeControls
        })
        function setupGlobeControls() {
            console.log(globe.object3D);
            window.orbitControls.target = globe.object3D.position;
            window.orbitControls.autoRotate = false;
            window.orbitControls.enablePan = false
            window.orbitControls.minDistance = 2;
            window.orbitControls.maxDistance = 6;
        }
    };

    const whaleIds = ["sperm-whale","blue-whale","humpback-whale"];
    var currentIndex = whaleIds.indexOf(selectedWhaleId);
    function launchWhaleSelectMenu(){
        globe.object3D.scale.set(0,0,0);
        inWhaleSelection = true;
        console.log("Whale Selector");
        showSelectedWhale();

        AFRAME.ANIME({
            targets: [whaleSelector.object3D.scale],
            x: 0.5,
            y: 0.5,
            z: 0.5,
            easing: 'easeOutQuint',
            duration: 750
        });
    }
    function exitWhaleSelectMenu(){
        whaleSelector.object3D.scale.set(0,0,0);
        inWhaleSelection = false;

        AFRAME.ANIME({
            targets: [globe.object3D.scale],
            x: 1,
            y: 1,
            z: 1,
            easing: 'easeOutQuint',
            duration: 750
        });
    }
    function nextWhale(){
        whaleSelector.object3D.scale.set(0,0,0);
        currentIndex = (currentIndex + 1 + whaleIds.length) % whaleIds.length;
        selectedWhaleId = whaleIds[currentIndex];
        showSelectedWhale();
        AFRAME.ANIME({
            targets: [whaleSelector.object3D.scale],
            x: 0.5,
            y: 0.5,
            z: 0.5,
            easing: 'easeOutQuint',
            duration: 500
        });
    }
    function prevWhale(){
        whaleSelector.object3D.scale.set(0,0,0);
        currentIndex = (currentIndex - 1 + whaleIds.length) % whaleIds.length;
        selectedWhaleId = whaleIds[currentIndex];
        showSelectedWhale();
        AFRAME.ANIME({
            targets: [whaleSelector.object3D.scale],
            x: 0.5,
            y: 0.5,
            z: 0.5,
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
          scale="0 0 0">
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
    <div class="whale-menu">
        {#if !inWhaleSelection}
            <button class="whale-selector-button" on:click={launchWhaleSelectMenu} aria-label="Enter Whale Selector">
                <svg width="90" height="90">
                    <image xlink:href="../src/assets/whale-selector-button.svg" width="90" height="90"/>
                </svg>
            </button>
        {:else}
            <div style="display: flex; justify-content: center;">
                <button class="whale-selector-left-button" on:click={prevWhale} aria-label="Previous Whale">
                    <svg width="70" height="70">
                        <image xlink:href="../src/assets/chevron-left-button.svg" width="70" height="70"/>
                    </svg>
                </button>
                <button class="globe-button" on:click={exitWhaleSelectMenu} aria-label="Return to Globe">
                    <svg width="90" height="90">
                        <image xlink:href="../src/assets/globe-button.svg" width="90" height="90"/>
                    </svg>
                </button>
                <button class="whale-selector-right-button" on:click={nextWhale} aria-label="Next Whale">
                    <svg width="70" height="70">
                        <image xlink:href="../src/assets/chevron-right-button.svg" width="70" height="70"/>
                    </svg>
                </button>
            </div>
        {/if}
    </div>
{/if}
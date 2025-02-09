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

    let shippingPopup = $state(false);
    let shippingPopupShown = $state(false);

    let ttsEnabled = $state(false);
    let ttsInProgress = $state(false);
    let ttsText;
    let ttsCaption;

    let playingCall = $state(false);

    let whaleCallClip;

    let soundWavesObject;

    export const appInit = (latestScanPatternUrl) => {
        selectedWhaleId = latestScanPatternUrl;
        appLaunched = true;
        window.orbitControls.enabled = true;
        globe = document.querySelector("#globe");
        whaleSelector = document.querySelector("#whale-selector");
        globe.setAttribute("visible", true);

        globeMaterial1 = globe.object3D.children[3].children[0].material;
        globeMaterial2 = globe.object3D.children[3].children[1].material;
        globeMaterial3 = globe.object3D.children[3].children[2].material;
        globe.object3D.children[3].children[2].renderOrder = 1;
        globe.object3D.children[3].children[1].renderOrder = 2;
        //overlayMaterial.copy(globe.object3D.children[0].children[0].material);

        globeMaterial2.map = textureLoader.load("/assets/planet-overlays/shipping-overlay.png");
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
            window.orbitControls.target = globe.object3D.position;
            //window.orbitControls.autoRotate = true;
            window.orbitControls.rotateSpeed = 1;
            window.orbitControls.enableDamping = true;
            window.orbitControls.dampingFactor = 0.1;
            window.orbitControls.enablePan = false
            window.orbitControls.minDistance = 2;
            window.orbitControls.maxDistance = 6;

            camera = window.camera;
            defaultCameraPos = camera.position;
            defaultCameraRot = camera.rotation;
        }
        SetGlobeOverlay();
        showSelectedWhale();

        soundWavesObject = document.querySelector("#audio-waves");
    };

    function resetCamera(){
        window.orbitControls.enabled = false;
        camera.position.set(0,0,0);
        window.orbitControls.enabled = true;
    }

    const whaleIds = ['sperm-whale','blue-whale','humpback-whale'];
    function launchWhaleSelectMenu(){
        currentIndex = whaleIds.indexOf(selectedWhaleId);

        resetCamera()
        globe.setAttribute("visible", false);
        whaleSelector.setAttribute("visible", true);
        globe.object3D.scale.set(0,0,0);
        whaleSelector.object3D.scale.set(0,0,0);
        inWhaleSelection = true;
        showSelectedWhale();

        AFRAME.ANIME({
            targets: [whaleSelector.object3D.scale],
            x: 0.3,
            y: 0.3,
            z: 0.3,
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
        if(ttsEnabled) {
            runTTS(selectedWhaleId);
        }
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
        if(ttsEnabled) {
            runTTS(selectedWhaleId);
        }
    }

    function showSelectedWhale(){
        whaleIds.forEach((whaleId) => {
            document.getElementById(whaleId).setAttribute("visible", false);
            document.getElementById(whaleId+"-globe").setAttribute("visible", false);
            if(whaleId == selectedWhaleId){
                document.getElementById(whaleId).setAttribute("visible", true);
                document.getElementById(whaleId+"-globe").setAttribute("visible", true);
            }
        })
    }

    function toggleShipOverlay(){
        globeMaterial2.visible = !globeMaterial2.visible;
        shipVisible = !shipVisible;
        if(shipVisible && !shippingPopupShown){
            if(ttsEnabled) {
                shippingPopupShown = true;
                runTTS("ships");
            }
        }
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
        globeMaterial3.opacity = 0.5;
        globeMaterial3.needsUpdate = true;
    }

    function toggleTTS(){
        ttsEnabled = !ttsEnabled;
        if(ttsEnabled && !ttsInProgress) {
            runTTS(selectedWhaleId);
        }
        else if (!ttsEnabled){
            window.speechSynthesis.cancel();
            ttsInProgress = false;
            ttsCaption.style.display = "none";
        }
    }
    function runTTS(id){
        window.speechSynthesis.cancel();
        var lines = window.whaleXML[id]["tts"];
        for (var i = 0; i < lines.length; i++) {
            var msg = new SpeechSynthesisUtterance();
            //msg.voice = window.speechSynthesis.getVoices()[0];
            msg.text = lines[i];
            msg.onstart = (event) => {
                ttsInProgress = true;
                ttsCaption.style.display = "block";
                ttsText.innerHTML = event.utterance.text;
            };

            if (i === lines.length - 1) {
                msg.onend = (event) => {
                    ttsInProgress = false;
                    ttsCaption.style.display = "none";
                };
            }

            window.speechSynthesis.speak(msg);
        }
    }

    function playWhaleCall(){
        if(playingCall === false) {
            whaleCallClip = new Howl({
                src: ['/assets/' + window.whaleXML[selectedWhaleId]["audio"]],
                onend: function () {
                    playingCall = false;
                    soundWavesObject.setAttribute("visible", false);
                }
            });
            playingCall = true;
            soundWavesObject.setAttribute("visible", true);
            whaleCallClip.play();
        }
    }


</script>

<a-entity
        id="globe"
        loaded-gltf-model="modelId: earth-model"
        position="0 0 -6"
        scale="0 0 0"
        rotation="0 0 0"
        visible="true">
    <a-entity
            id="sperm-whale-globe"
            scale="1 1 1"
            loaded-gltf-model="modelId: sperm-whales"
            animation-mixer="clip: *"
            visible="false">
    </a-entity>
    <a-entity
            id="blue-whale-globe"
            scale="1 1 1"
            loaded-gltf-model="modelId: blue-whales"
            animation-mixer="clip: *"
            visible="false">
    </a-entity>
    <a-entity
            id="humpback-whale-globe"
            scale="1 1 1"
            loaded-gltf-model="modelId: humpback-whales"
            animation-mixer="clip: *"
            visible="false">
    </a-entity>
</a-entity>

<a-entity id="whale-selector"
          position="0 0 -6"
          scale="0 0 0"
          visible="true">
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
            position="-1 -1 0"
            scale="0.2 0.2 0.2"
            rotation="0 -90 0"
    ></a-entity>
    <a-entity id="audio-waves"
              visible="false"
              loaded-gltf-model="modelId: audio-waves-model"
              animation-mixer
              position="-3 0 0"
              scale="1.5 1.5 1.5"
              rotation="0 0 0"
    >
    </a-entity>
</a-entity>

{#if appLaunched}
    <div class="map-options">
        <div id="tts-div">
            <button class="tts-button" onclick={toggleTTS} aria-label="Text to speech information about whale">
                {#if !ttsEnabled}
                    <svg width="40" height="40">
                        <image xlink:href="/assets/tts-icon-1.svg" width="40" height="40"/>
                    </svg>
                {:else}
                    <svg width="40" height="40">
                        <image xlink:href="/assets/tts-icon-2.svg" width="40" height="40"/>
                    </svg>
                {/if}
            </button>
        </div>
        {#if !inWhaleSelection}
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
        {/if}
    </div>
    {#if !inWhaleSelection}
        <div class="map-key">
            {#if shipVisible}
                <div style="border: 1px solid white">
                    <svg width="100" height="40">
                        <image xlink:href="/assets/ship-key.svg" width="100" height="40"/>
                    </svg>
                </div>
            {/if}
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
            <div>
                <h1><b>Selected whale:</b> {window.whaleXML[selectedWhaleId]["name"]}</h1>
                <h2>
                    {window.whaleXML[selectedWhaleId]["status"]}<br>
                    <b>Length:</b> {window.whaleXML[selectedWhaleId]["length"]}<br>
                    <b>Population:</b> {window.whaleXML[selectedWhaleId]["population"]}
                    <div>
                        <b>Whale Call:</b>
                        <button onclick={playWhaleCall} aria-label="Play Whale Call">
                            {#if playingCall}
                                <svg width="25" height="25">
                                    <image xlink:href="/assets/play-button-2.svg" width="25" height="25"/>
                                </svg>
                            {:else}
                                <svg width="25" height="25">
                                    <image xlink:href="/assets/play-button-1.svg" width="25" height="25"/>
                                </svg>
                            {/if}
                        </button>
                    </div>
                </h2>
            </div>
        </div>
    {/if}

    <div bind:this={ttsCaption} class="tts-caption" style="display: none">
        <p bind:this={ttsText}></p>
    </div>
{/if}
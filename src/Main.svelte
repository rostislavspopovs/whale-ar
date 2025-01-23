<script>
// @ts-nocheck
    import * as THREEAR from "threear";
    import "aframe";
import {
    Color,
    Group,
    WebGLRenderer,
    PerspectiveCamera, Object3D, LoadingManager,
} from "three";
    import ARScene from "./ARScene.svelte";
    import {InteractionManager} from "three.interactive";
    import {WhaleData} from "./WhaleData.js";
    import App from "./App.svelte";
    import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
    import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader.js";

    var markerFound = false;
    var markerFoundPrev = false;
    var latestScanPatternUrl = "";

    var renderer = new WebGLRenderer({
        antialias: true,
        alpha: true
    });
    renderer.setClearColor(new Color('lightgrey'), 0)
    renderer.setPixelRatio( 3 );
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.domElement.style.position = 'absolute'
    renderer.domElement.style.top = '0px'
    renderer.domElement.style.left = '0px'
    document.body.appendChild( renderer.domElement );

    let arReady = $state(false);

    let arScene = $state(); //bound through svelte
    let appScene; //bound through svelte

    let arController = $state();
    let camera = $state();
    let scene = $state();
    let markerRoot;
    let markerDummy = $state();

    let appLaunched = $state(false);
    let initialiseAppFunc = $state();

    let infoPanelOpened = $state(false);

    window.onload = run;

    AFRAME.registerComponent("log", {
        init: function () {
            this.el.addEventListener("loaded", () => {
                document.dispatchEvent(new Event("allAssetsLoaded"));
                console.log(AFRAME.THREE.Cache.files);
                console.log("Window Loaded");
                setTimeout(() => {
                    arReady = true;
                }, 0)
            })
        }
    });

    AFRAME.registerComponent("loaded-gltf-model", {
        schema: {
            modelId: {type: 'string'}
        },
        init: function () {
            document.addEventListener("allAssetsLoaded", () => {
                this.el.setAttribute("gltf-model", "#"+this.data.modelId);
                console.log("Updated gltf-model for "+this.data.modelId);
            })
        }
    });


    function run () {

        async function loadWhaleData(){
            window.whaleXML = await WhaleData.getWhales();
        }
        loadWhaleData().then(_=> {
            window.whaleXML = window.whaleXML["whales"];
            console.log(window.whaleXML);
        });

        scene = document.querySelector('a-scene').object3D;

        camera = new PerspectiveCamera();
        camera.name = "JS Perspective Camera";
        scene.camera = camera;

        scene.add(camera);

        window.interactionManager = new InteractionManager(renderer, camera, renderer.domElement);
        window.camera = camera;
        window.orbitControls = new OrbitControls( camera, renderer.domElement );
        window.orbitControls.enabled = false;


        markerDummy = new Group();
        scene.add(markerDummy);

        markerRoot = document.querySelector("#ar-root").object3D;
        markerRoot.visible = false;
        scene.add(markerRoot);

        var source = new THREEAR.Source({ renderer, camera });

        THREEAR.initialize({source: source,
            patternRatio:0.6,
            canvasWidth: 640,
            canvasHeight: 480,
            detectionMode: "mono_and_matrix",
            maxDetectionRate: 0,
            imageSmoothingEnabled:true,
            lostTimeout: 750,
            positioning: {
                smooth:true,
                smoothCount: 4,
                smoothTolerance: 0.009,
                smoothThreshold: 2
            }}).then((controller) => {
                console.log("AR Initialised");
                arController = controller;
            var spermMarker = new THREEAR.PatternMarker({
                patternUrl: '/data/patterns/sperm-whale.patt',
                markerObject: markerDummy,
                minConfidence: 0.05,
            });
            var blueMarker = new THREEAR.PatternMarker({
                patternUrl: '/data/patterns/blue-whale.patt',
                markerObject: markerDummy,
                minConfidence: 0.05,
            });
            var humpbackMarker = new THREEAR.PatternMarker({
                patternUrl: '/data/patterns/humpback-whale.patt',
                markerObject: markerDummy,
                minConfidence: 0.05,
            });

            let sceneEl = document.querySelector("#a-frame-scene");

            arController.trackMarker(spermMarker);
            arController.trackMarker(blueMarker);
            arController.trackMarker(humpbackMarker);

            arController.addEventListener('markerFound', function(event) {
                markerFound = true;
                markerRoot.visible = true;
                console.log(event.marker.patternUrl);
                latestScanPatternUrl = event.marker.patternUrl.split('/')[3].slice(0,-5);
            });
            arController.addEventListener('markerLost', function(event) {
                markerFound = false;
            });

            requestAnimationFrame(function animate(nowMsec){
                requestAnimationFrame( animate );
                arController.update( source.domElement );
                window.interactionManager.update();
                renderer.render( scene, camera );
                if(markerFound) {
                    markerRoot.position.lerp(markerDummy.position, 1);
                    markerRoot.quaternion.slerp(markerDummy.quaternion, 1);
                }
                if(markerFound && !markerFoundPrev){
                    onMarkerFound();
                }
                else if (!markerFound && markerFoundPrev){
                    onMarkerLost();
                }
                markerFoundPrev = markerFound;

                window.orbitControls.update();
                console.log(camera.rotation);
            });


            function onMarkerFound(){
                arScene.onMarkerFound(latestScanPatternUrl);
                AFRAME.ANIME({
                    targets: 'video',
                    opacity: 0.6,
                    easing: 'easeOutSine',
                    duration: 500
                })
            }

            function onMarkerLost(){
                arScene.onMarkerLost();
                AFRAME.ANIME({
                    targets: 'video',
                    opacity: 1,
                    easing: 'easeOutSine',
                    duration: 500
                })
            }

            var redundantCam = sceneEl.querySelectorAll('a-entity')[0];
            //sceneEl.removeChild(redundantCam);
            sceneEl.removeChild(sceneEl.querySelector('.a-canvas'));
            
            //listSceneEntities();
            function listSceneEntities(){
                let sceneEl = document.querySelector("#a-frame-scene");
   
                var els = sceneEl.querySelectorAll('*');
                    for (var i = 0; i < els.length; i++) {
                        console.log(els[i]);
                    }
                }

            initialiseAppFunc = function (){
                setTimeout(function(){appLaunched=true}, 500);
                appScene.appInit(latestScanPatternUrl);
            }

        });
    }

    function beginScan(){
        const loadingScreen = document.getElementById( 'loading-screen' );
        loadingScreen.classList.add( 'fade-out' );
        loadingScreen.classList.add('mouse-passthrough')
        arController.parameters.maxDetectionRate = 60;
    }

    function toggleInfoPanel(){
        infoPanelOpened = !infoPanelOpened;
    }
</script>
<a-scene xr-mode-ui="enabled: false" id="a-frame-scene" light="defaultLightsEnabled: false" log>

    <a-assets>
        <a-asset-item id="earth-model" src="/assets/earth.glb"></a-asset-item>
        <a-asset-item id="sperm-whale-model" src="/assets/sperm-whale.glb"></a-asset-item>
        <a-asset-item id="blue-whale-model" src="/assets/blue-whale.glb"></a-asset-item>
        <a-asset-item id="humpback-whale-model" src="/assets/humpback-whale.glb"></a-asset-item>
    </a-assets>

    <a-entity light="type: hemisphere; color: #ffffff; groundColor: #5e5e5e; intensity: 4"></a-entity>
    <a-entity light="type: ambient; color: #ffffff; intensity: 5"></a-entity>
    {#if !appLaunched}
        <a-entity id="ar-root">
            <ARScene bind:this={arScene} arController={arController} camera={camera} scene={scene} markerDummy={markerDummy} onArFinish={initialiseAppFunc}/>
        </a-entity>
    {/if}

    <App bind:this={appScene}/>
</a-scene>

<section id="loading-screen">
    <h1 style="font-size: 60px; margin-top:5vh; text-align: center;">BLUE CORRIDORS</h1>
    {#if !arReady}
        <div id="loader"></div>
    {:else}
        <div>
            <button id="start-button" onclick={beginScan} aria-label="Start Scan">
                <svg width="150" height="150">
                    <image xlink:href="/assets/scan-icon.svg" width="150" height="150"/>
                </svg>
            </button>
            <h1>Start Scanning</h1>
        </div>
    {/if}
    <div style="margin-bottom:5vh">
        <svg width="100" height="100">
            <image xlink:href="/assets/volume-up-icon.svg" width="100" height="100"/>
        </svg>
        <h1>Turn up audio for best experience</h1>
    </div>
</section>
<button class="info-button" onclick={toggleInfoPanel} aria-label="Information">
    {#if infoPanelOpened}
        <svg width="30" height="30">
            <image xlink:href="/assets/close-icon.svg" width="30" height="30"/>
        </svg>
    {:else}
        <svg width="30" height="30">
            <image xlink:href="/assets/info-icon.svg" width="30" height="30"/>
        </svg>
    {/if}
</button>

{#if infoPanelOpened}
    <div class="info-panel" style="font-family: sans-serif;">
        <h1 style="font-family: WWF;">BLUE CORRIDORS</h1>
        <table>
            <thead>
            <tr>
                <td>
                    <svg height="100" width="100" style="margin-right:20px">
                        <image xlink:href="/assets/info-panel-graphic-1.svg" height="100" width="100"/>
                    </svg>
                </td>
                <td>
                    <p>Tap "Start Scanning" to launch the whale detector and point your phone camera to the postage stamp on your postcard.</p>
                </td>
            </tr>
            <tr>
                <td>
                    <svg height="100" width="100">
                        <image xlink:href="/assets/info-panel-graphic-2.svg" height="100" width="100"/>
                    </svg>
                </td>
                <td>
                    <p>Watch as your whale comes alive! Tap on the whale to travel up into
                    space where you are able to view and learn more about whale migration patterns.</p>
                </td>
            </tr>
            <tr>
                <td>
                    <svg height="100" width="100">
                        <image xlink:href="/assets/info-panel-graphic-3.svg" height="100" width="100"/>
                    </svg>
                </td>
                <td>
                    <p>The globe will be populated with the migration paths of your whale. Drag to move and pinch to zoom on the globe.</p>
                </td>
            </tr>
            <tr>
                <td>
                    <svg height="100" width="100" style="transform: scale(80%)">
                        <image xlink:href="/assets/whale-selector-button.svg" height="100" width="100"/>
                    </svg>
                </td>
                <td>
                    <p>Tap to choose a different whale - the globe will update to match the migration paths of your new whale.</p>
                </td>
            </tr>
            <tr>
                <td>
                    <svg height="100" width="100" style="transform: scale(50%)">
                        <image xlink:href="/assets/tts-button.svg" height="100" width="100"/>
                    </svg>
                </td>
                <td>
                    <p>Learn more about your selected whale via voiceover.</p>
                </td>
            </tr>
            <tr>
                <td>
                    <svg height="100" width="100" style="transform: scale(50%)">
                        <image xlink:href="/assets/track-button.svg" height="100" width="100"/>
                    </svg>
                </td>
                <td>
                    <p>Track your whale as it follows its migration path.</p>
                </td>
            </tr>
            </thead>
        </table>

        <a href="https://wwfwhales.org/protecting-blue-corridors" style="display: flex; align-items: center">
            <h1 style="font-family: WWF;">PROTECTING BLUE CORRIDORS</h1>
            <svg width="40" height="30">
                <image xlink:href="/assets/link-icon.svg" width="40" height="30"/>
            </svg>
        </a>
        <p> Whales rely on critical ocean habitats – areas where they
            feed, mate, give birth, nurse young, socialise or migrate.
            “Blue corridors” are migration superhighways that allow
            marine megafauna to move between these critical habitat
            areas, and are essential for their survival.</p>
        <p> Protecting Blue Corridors is a global collaboration on cetaceans and marine connectivity conservation</p>

        <h2 style="font-family: WWF;">COLLABORATORS</h2>
        <div style="width: 100%">
            <img style="width: 100%" src="/assets/collaborators.png">
        </div>

        <h2 style="font-family: WWF;">CREDITS</h2>
        <p> "Blue Corridors" Application <p>
        <p> Developed by <a href="https://rosspopovs.com">Ross Popovs</a> in collaboration with
            <a href="https://www.linkedin.com/in/julianstadon/">Dr Julian Stadon</a> and the
            <a href="https://www.southampton.ac.uk/research/institutes-centres/marine-maritime-institute">Southampton Marine and Maritime Institute</a>
        </p>
        <small>
            <p>Humpback Whale Model: "Whale" (https://skfb.ly/6GxJT) by Dirk.z; Sperm Whale Model: "Sperm Whale" (https://skfb.ly/oFq8D) by Bohdan Lvov; Blue Whale Model: "Blue whale" (https://skfb.ly/67nCt) by misaooo
                are licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/)</p>
            <p>Whale audio samples: Watkins Marine Mammal Sound Database, Woods Hole Oceanographic Institution and the New Bedford Whaling Museum.</p>
        </small>
    </div>
{/if}
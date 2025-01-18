
<script>
// @ts-nocheck
    import * as THREEAR from "threear";
    import "aframe";
    import {
        Color,
        Group,
        WebGLRenderer,
        PerspectiveCamera,
    } from "three";
    import ARScene from "./ARScene.svelte";
    import {InteractionManager} from "three.interactive";
    import {WhaleData} from "./WhaleData.js";
    import App from "./App.svelte";


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

    let arScene; //bound through svelte
    let appScene; //bound through svelte

    let arController;
    let camera;
    let scene;
    let markerRoot;
    let markerDummy;

    let appLaunched = false;
    let initialiseAppFunc;

    window.onload = run;

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

        markerDummy = new Group();
        scene.add(markerDummy);

        markerRoot = document.querySelector("#ar-root").object3D;
        markerRoot.visible = false;
        scene.add(markerRoot);

        var source = new THREEAR.Source({ renderer, camera });

        THREEAR.initialize({source: source,
            patternRatio:0.6,
            canvasWidth: 640*2,
            canvasHeight: 480*2,
            detectionMode: "mono_and_matrix",
            maxDetectionRate: 60,
            imageSmoothingEnabled:false,
            lostTimeout: 350,
            positioning: {
                smooth:true,
                smoothCount: 3,
                smoothTolerance: 0.002,
                smoothThreshold: 1
            }}).then((controller) => {

                arController = controller;
            var spermMarker = new THREEAR.PatternMarker({
                patternUrl: '../src/data/patterns/sperm-whale.patt',
                markerObject: markerDummy,
                minConfidence: 0.05,
            });
            var blueMarker = new THREEAR.PatternMarker({
                patternUrl: '../src/data/patterns/blue-whale.patt',
                markerObject: markerDummy,
                minConfidence: 0.05,
            });
            var humpbackMarker = new THREEAR.PatternMarker({
                patternUrl: '../src/data/patterns/humpback-whale.patt',
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
                latestScanPatternUrl = event.marker.patternUrl.split('/')[4].slice(0,-5);
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
                appScene.appInit();
            }
        });
    }
</script>
<a-scene inspector xr-mode-ui="enabled: false" id="a-frame-scene" light="defaultLightsEnabled: false">
    <a-entity light="type: hemisphere; color: #ffffff; groundColor: #5e5e5e; intensity: 4"></a-entity>
    <a-entity light="type: ambient; color: #ffffff; intensity: 5"></a-entity>
    {#if !appLaunched}
        <a-entity id="ar-root">
            <ARScene bind:this={arScene} arController={arController} camera={camera} scene={scene} markerDummy={markerDummy} onArFinish={initialiseAppFunc}/>
        </a-entity>
    {/if}

    <App bind:this={appScene}/>

</a-scene>
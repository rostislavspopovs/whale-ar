
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

    let interactionManager;

    window.onload = run;

    function run () {

        async function loadWhaleData(){
            window.whaleXML = await WhaleData.getWhales();
        }
        loadWhaleData().then(_=> {
            window.whaleXML = window.whaleXML["whales"];
            console.log(window.whaleXML);
        });

        var scene = document.querySelector('a-scene').object3D;

        let camera = new PerspectiveCamera();
        camera.name = "JS Perspective Camera";
        scene.camera = camera;

        scene.add(camera);

        interactionManager = new InteractionManager(renderer, camera, renderer.domElement);

        var markerDummy = new Group();
        scene.add(markerDummy);

        var markerRoot = document.querySelector("#ar-root").object3D;
        markerRoot.visible = false;
        scene.add(markerRoot);

        var source = new THREEAR.Source({ renderer, camera });

        THREEAR.initialize({source: source,
            patternRatio:0.9,
            canvasWidth: 640,
            canvasHeight: 480,
            detectionMode: "mono_and_matrix",
            maxDetectionRate: 60,
            imageSmoothingEnabled:true,
            lostTimeout: 350,
            positioning: {
                smooth:true,
                smoothCount: 4,
                smoothTolerance: 0.008,
                smoothThreshold: 2
            }}).then((controller) => {

            var spermMarker = new THREEAR.PatternMarker({
                patternUrl: '../src/data/patterns/sperm-whale.patt',
                markerObject: markerDummy,
                minConfidence: 0.01,
            });
            var blueMarker = new THREEAR.PatternMarker({
                patternUrl: '../src/data/patterns/blue-whale.patt',
                markerObject: markerDummy,
                minConfidence: 0.01,
            });
            var humpbackMarker = new THREEAR.PatternMarker({
                patternUrl: '../src/data/patterns/humpback-whale.patt',
                markerObject: markerDummy,
                minConfidence: 0.01,
            });

            let sceneEl = document.querySelector("#a-frame-scene");

            controller.trackMarker(spermMarker);
            controller.trackMarker(blueMarker);
            controller.trackMarker(humpbackMarker);

            controller.addEventListener('markerFound', function(event) {
                markerFound = true;
                markerRoot.visible = true;
                latestScanPatternUrl = event.marker.patternUrl.split('/')[4].slice(0,-5);
            });
            controller.addEventListener('markerLost', function(event) {
                markerFound = false;
            });

            requestAnimationFrame(function animate(nowMsec){

                requestAnimationFrame( animate );
                controller.update( source.domElement );
                renderer.render( scene, camera );
                if(markerFound) {
                    markerRoot.position.lerp(markerDummy.position, 0.99);
                    markerRoot.quaternion.slerp(markerDummy.quaternion, 0.99);
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
                    opacity: 0.25,
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
        });
    };
</script>

<a-scene xr-mode-ui="enabled: false" id="a-frame-scene" light="defaultLightsEnabled: false" cursor="rayOrigin: mouse">
    <a-entity id="ar-root">
        <ARScene bind:this={arScene} {interactionManager}/>
    </a-entity>
</a-scene>
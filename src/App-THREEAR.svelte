
<script>
// @ts-nocheck

    import * as THREEAR from "threear";
    import "aframe";
    import {
        Color,
        Group,
        Scene,
        WebGLRenderer,
        TextureLoader,
        MeshBasicMaterial,
        PlaneGeometry,
        Mesh,
        Clock,
        AmbientLight,
        BoxGeometry,
        PerspectiveCamera,
        Vector3,
        Vector4,
        TorusKnotGeometry,
        MeshNormalMaterial, DoubleSide
    } from "three";
    import ARScene from "./ARScene.svelte";
    import { mount } from 'svelte'

    var markerFound = false;

    var renderer = new WebGLRenderer({
        antialias: true,
        alpha: true
    });
    renderer.setClearColor(new Color('lightgrey'), 0)
    renderer.setPixelRatio( 3 );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.domElement.style.position = 'absolute'
    renderer.domElement.style.top = '0px'
    renderer.domElement.style.left = '0px'
    document.body.appendChild( renderer.domElement );

    window.onload = run;

    function run () {

        var scene = document.querySelector('a-scene').object3D;

        let camera = new PerspectiveCamera();
        camera.name = "JS Perspective Camera";
        scene.camera = camera;
        scene.add(camera);

        var markerDummy = new Group();
        scene.add(markerDummy);

        var markerRoot = document.querySelector("#ar-root").object3D;
        scene.add(markerRoot);
        console.log(markerRoot);

        var source = new THREEAR.Source({ renderer, camera });

        THREEAR.initialize({source: source,
            patternRatio:0.9,
            canvasWidth: 640,
            canvasHeight: 480,
            detectionMode: "mono_and_matrix",
            imageSmoothingEnabled:false,
            positioning: {
                smooth:true,
                smoothCount: 8,
                smoothTolerance: 0.01,
                smoothThreshold: 4
            }}).then((controller) => {

            var patternMarker = new THREEAR.PatternMarker({
                patternUrl: '../src/data/patterns/pattern-whale-marker.patt',
                markerObject: markerRoot,
                minConfidence: 0.01,
            });


            controller.trackMarker(patternMarker);
            controller.addEventListener('markerFound', function(event) {
                markerFound = true;
                console.log('markerFound', event);
            });
            controller.addEventListener('markerLost', function(event) {
                markerFound = false;
                console.log('markerLost', event);
            });

            // run the rendering loop
            var lastTimeMsec = 0;
            requestAnimationFrame(function animate(nowMsec){
                requestAnimationFrame( animate );
                controller.update( source.domElement );
                renderer.render( scene, camera );
                // if(markerFound) {
                //     markerRoot.position.lerp(markerDummy.position, 0.9);
                //     markerRoot.quaternion.slerp(markerDummy.quaternion, 0.9);
                // }
            });

            let sceneEl = document.querySelector("#a-frame-scene");
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

<a-scene inspect id="a-frame-scene">
    <a-entity id="ar-root">
        <ARScene/> 
    </a-entity>
</a-scene>
<script>
    import * as THREEAR from "threear";
    import {
        Camera,
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
    import {ARScene} from "./ARScene.js";

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

    // init scene and camera
    var scene = new Scene();
    var camera = new PerspectiveCamera();
    scene.add(camera);

    var markerGroup = new Group();
    var markerDummy = new Group();

    let arScene = new ARScene(renderer, camera);
    markerGroup.add(arScene.group);

    scene.add(markerGroup);

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
            markerObject: markerDummy,
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
            if(markerFound) {
                markerGroup.position.lerp(markerDummy.position, 0.7);
                markerGroup.quaternion.slerp(markerDummy.quaternion, 0.7);
            }
        });

    });

</script>


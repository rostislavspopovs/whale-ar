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

    var renderer = new WebGLRenderer({
        alpha: true
    });
    renderer.setClearColor(new Color('lightgrey'), 0)
    // renderer.setPixelRatio( 2 );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.domElement.style.position = 'absolute'
    renderer.domElement.style.top = '0px'
    renderer.domElement.style.left = '0px'
    document.body.appendChild( renderer.domElement );

    // init scene and camera
    var scene = new Scene();
    var camera = new Camera();
    scene.add(camera);

    var markerGroup = new Group();
    scene.add(markerGroup);

    var source = new THREEAR.Source({ renderer, camera });

    THREEAR.initialize({source: source, patternRatio:0.85}).then((controller) => {

        // add a torus knot
        var geometry = new TorusKnotGeometry(0.3,0.1,64,16);
        var material = new MeshNormalMaterial();
        var torus = new Mesh( geometry, material );
        torus.position.y = 0.5
        markerGroup.add(torus);

        var patternMarker = new THREEAR.PatternMarker({
            patternUrl: '../src/data/patterns/pattern-whale-marker.patt',
            markerObject: markerGroup
        });

        controller.trackMarker(patternMarker);
        controller.addEventListener('markerFound', function(event) {
            console.log('markerFound', event);
        });
        controller.addEventListener('markerLost', function(event) {
            console.log('markerLost', event);
        });

        // run the rendering loop
        var lastTimeMsec = 0;
        requestAnimationFrame(function animate(nowMsec){
            requestAnimationFrame( animate );
            controller.update( source.domElement );
            renderer.render( scene, camera );
        });

    });

</script>


<script lang="ts">
    import {Canvas} from '@threlte/core'
    import {
        Camera,
        Color,
        Group,
        Scene,
        WebGLRenderer,
        TextureLoader,
        MeshBasicMaterial,
        PlaneGeometry,
        Mesh, Clock, AmbientLight, BoxGeometry, PerspectiveCamera, Vector3
    } from "three";
    import { ArToolkitSource, ArToolkitContext, ArMarkerControls} from '@ar-js-org/ar.js/three.js/build/ar-threex.js';
    import {ARScene} from "./ARScene.js"

  //////////////////////////////////////////////////////////////////////////////////
  //		Init
  //////////////////////////////////////////////////////////////////////////////////

  var renderer = new WebGLRenderer({
      antialias: true,
      alpha: true,
      logarithmicDepthBuffer: false,
      reverseDepthBuffer: false,
  });

  var deltaTime : number, totalTime : number;

  var clock = new Clock();

  var mesh1;

  var width = 640; var height = 480;

  let markerFound = false;

  renderer.setPixelRatio(window.devicePixelRatio);

  renderer.setClearColor(new Color('lightgrey'), 0)
  renderer.setSize( width, height );
  renderer.domElement.style.position = 'absolute'
  renderer.domElement.style.top = '0px'
  renderer.domElement.style.left = '0px'
  document.body.appendChild( renderer.domElement );

  // init scene and camera
  var scene = new Scene();

  //////////////////////////////////////////////////////////////////////////////////
  //		Initialize a basic camera
  //////////////////////////////////////////////////////////////////////////////////

  // Create a camera
  var camera = new PerspectiveCamera(40, width / height, 1000, 10000);
  camera.near = 10;
  camera.far = 10000;
  camera.updateProjectionMatrix();
  scene.add(camera);

  var light = new AmbientLight(Color.NAMES.white, 2.2);
  scene.add(light);

  ////////////////////////////////////////////////////////////////////////////////
  //          handle arToolkitSource
  ////////////////////////////////////////////////////////////////////////////////

  var arToolkitSource = new ArToolkitSource({
      sourceType : 'webcam'
  })

    function onResize(){
        arToolkitSource.onResizeElement()
        arToolkitSource.copyElementSizeTo(renderer.domElement)
        //if( arToolkitContext.arController !== null ){
        arToolkitSource.copyElementSizeTo(arToolkitContext.arController.canvas)
        //}
    }

  arToolkitSource.init(function onReady(){
      // use a resize to fullscreen mobile devices
      setTimeout(function() {
          onResize()
      }, 1000);
  })

  // handle resize
  window.addEventListener('resize', function(){
      onResize()
  })

    function getSourceOrientation() {
        console.log(
            "actual source dimensions",
            arToolkitSource.domElement.clientWidth,
            arToolkitSource.domElement.clientHeight
        );

        if (arToolkitSource.domElement.clientWidth > arToolkitSource.domElement.clientHeight) {
            console.log("source orientation", "landscape");
            return "landscape";
        } else {
            console.log("source orientation", "portrait");
            return "portrait";
        }
    }

  ////////////////////////////////////////////////////////////////////////////////
  //          initialize arToolkitContext
  ////////////////////////////////////////////////////////////////////////////////

  // create atToolkitContext
  var arToolkitContext = new ArToolkitContext({
      detectionMode: 'mono',
      canvasWidth: width,
      canvasHeight: height,
  }, {
      sourceWidth: width,
      sourceHeight: height,
  })
    arToolkitContext.near = 100;
    arToolkitContext.far = 10000;

  // initialize it
  arToolkitContext.init(function onCompleted(){
      // copy projection matrix to camera
      //camera.projectionMatrix.copy( arToolkitContext.getProjectionMatrix() );
      arToolkitContext.arController.orientation = getSourceOrientation();
      arToolkitContext.arController.options.orientation = getSourceOrientation();
  })

  ////////////////////////////////////////////////////////////////////////////////
  //          Create a ArMarkerControls
  ////////////////////////////////////////////////////////////////////////////////

  // init controls for camera
    var camTrackerRoot = new Group();
    scene.add(camTrackerRoot);

    var contentRoot = new Group();
    scene.add(contentRoot);

  var markerControls = new ArMarkerControls(arToolkitContext, camTrackerRoot, {
      type : 'nft',
      size : 0.16,
      descriptorsUrl : "../src/data/patterns/whale1",
      changeMatrixMode: "cameraTransformMatrix",
      smooth: true,
      smoothCount: 30,
      smoothTolerance: 0.1,
      smoothThreshold: 15
  })



    markerControls.addEventListener("markerFound", (e) => {
        if(markerFound == false){
            markerFound = true;
            camera.position.lerp(camTrackerRoot.position, 1);
            camera.quaternion.slerp(camTrackerRoot.quaternion, 1);

            renderer.domElement.style.opacity = "1";
        }
    })

    window.addEventListener("markerLost", (e) => {
        if(markerFound == true){
            markerFound = false;
            renderer.domElement.style.opacity = "0.2";
        }
    })



  scene.visible = false;

  //////////////////////////////////////////////////////////////////////////////////
  //		add an object in the scene
  //////////////////////////////////////////////////////////////////////////////////

    var arScene = new ARScene(render);
    contentRoot.add(arScene.group);


  animate();

  function animate()
  {

      requestAnimationFrame(animate);
      deltaTime = clock.getDelta();
      totalTime += deltaTime

      if(camera.position.distanceTo(camTrackerRoot.position) < 800) {
          camera.position.lerp(camTrackerRoot.position, 0.15);
          camera.quaternion.slerp(camTrackerRoot.quaternion, 0.15);
      }


      if ( arToolkitSource.ready !== false )
          arToolkitContext.update( arToolkitSource.domElement );

      scene.visible = true;

      //console.log(markerFound);

      render();
  }

  function render(){
      renderer.render( scene, camera );
  }
</script>

<main>
    <div class="arjs-loader">
        <div class="arjs-loader-spinner"></div>
    </div>
    <div id="marker-lost-notice">
        <h1>Marker lost, return to postcard</h1>
    </div>
</main>






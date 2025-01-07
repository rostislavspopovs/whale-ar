
<script lang="ts">
    import {
        Color,
        Group,
        Scene,
        WebGLRenderer,
        AmbientLight, PerspectiveCamera
    } from "three";
    import { ArToolkitSource, ArToolkitContext, ArMarkerControls} from '@ar-js-org/ar.js/three.js/build/ar-threex.js';
    import {ARScene} from "./ARScene.js"
    import WhaleDescription from "./WhaleDescription.svelte";

  //////////////////////////////////////////////////////////////////////////////////
  //		Init
  //////////////////////////////////////////////////////////////////////////////////

  var renderer = new WebGLRenderer({
      antialias: false,
      alpha: true,
      logarithmicDepthBuffer: false,
      reverseDepthBuffer: false,
  });
  var width = 1080; var height = 1920;
  let markerNotYetFound = true;
  let markerFound = false;

  renderer.setClearColor(new Color('lightgrey'), 0)
  renderer.setSize( height, width );
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
  var camera = new PerspectiveCamera(40, height / width, 10, 10000);
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
      sourceType : 'webcam',
      //Quality
      sourceWidth: height*0.8,
      sourceHeight: width*0.8,
      displayWidth: height*0.8,
      displayHeight: width*0.8,
  })

    function onResize(){
        arToolkitSource.onResizeElement()
        arToolkitSource.copyElementSizeTo(renderer.domElement)
        if( arToolkitContext.arController !== null ){
            arToolkitSource.copyElementSizeTo(arToolkitContext.arController.canvas)
        }
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


  ////////////////////////////////////////////////////////////////////////////////
  //          initialize arToolkitContext
  ////////////////////////////////////////////////////////////////////////////////

  // create atToolkitContext
  var arToolkitContext = new ArToolkitContext({
      detectionMode: 'mono',
      canvasWidth: height*0.8,
      canvasHeight: width*0.8
  })
    arToolkitContext.near = 100;
    arToolkitContext.far = 10000;

  // initialize it
  arToolkitContext.init(function onCompleted(){
      // copy projection matrix to camera
      //camera.projectionMatrix.copy( arToolkitContext.getProjectionMatrix() );
      camera.near = 10;
      camera.far = 10000;
      camera.updateProjectionMatrix();
      arToolkitContext.arController.orientation = "portrait";
      arToolkitContext.arController.options.orientation = "portrait";
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

    //var markerLostNotice = document.getElementById("marker-lost-notice");

    markerControls.addEventListener("markerFound", () => {
        if(markerFound == false){
            markerNotYetFound = false;
            markerFound = true;
            camera.position.lerp(camTrackerRoot.position, 1);
            camera.quaternion.slerp(camTrackerRoot.quaternion, 1);

            renderer.domElement.style.opacity = "1";

            //markerLostNotice.style.visibility = "hidden";
        }
    })

    window.addEventListener("markerLost", () => {
        if(markerFound == true){
            markerFound = false;
            renderer.domElement.style.opacity = "0.4";

            //markerLostNotice.style.visibility = "visible";
        }
    })



  scene.visible = false;

  //////////////////////////////////////////////////////////////////////////////////
  //		add an object in the scene
  //////////////////////////////////////////////////////////////////////////////////

    var arScene = new ARScene(renderer, camera);
    contentRoot.add(arScene.group);


  update();

  function update()
  {

      requestAnimationFrame(update);

      if(camera.position.distanceTo(camTrackerRoot.position) < 1000) {
          camera.position.lerp(camTrackerRoot.position, 0.15);
          camera.quaternion.slerp(camTrackerRoot.quaternion, 0.15);
      }


      if ( arToolkitSource.ready !== false )
          arToolkitContext.update( arToolkitSource.domElement );

      scene.visible = true;

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
    {#if !markerFound}
        <div id="marker-lost-notice">
            {#if markerNotYetFound}
                <h2>Please point camera at postcard</h2>
            {:else}
                <h2>Marker lost, return to postcard</h2>
            {/if}
        </div>
    {/if}
    <WhaleDescription/>
</main>





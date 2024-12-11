<script lang="ts">
    import {Canvas} from '@threlte/core'
    import {
        Camera,
        Color,
        Group,
        Scene,
        WebGLRenderer,
        BufferGeometry,
        TextureLoader,
        MeshBasicMaterial,
        PlaneGeometry,
        Mesh, Clock, AmbientLight, Object3D, AnimationMixer, AnimationClip, BoxGeometry, Vector3
    } from "three";
    import { ArToolkitSource, ArToolkitContext, ArMarkerControls} from '@ar-js-org/ar.js/three.js/build/ar-threex.js';


  //////////////////////////////////////////////////////////////////////////////////
  //		Init
  //////////////////////////////////////////////////////////////////////////////////

  var renderer = new WebGLRenderer({
      antialias: true,
      alpha: true,
      logarithmicDepthBuffer: true
  });

  var deltaTime : number, totalTime : number;

  var clock = new Clock();

  let mixers = [];

  var mesh1;

  renderer.setPixelRatio(window.devicePixelRatio);

  renderer.setClearColor(new Color('lightgrey'), 0)
  renderer.setSize( window.innerWidth, window.innerHeight );
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
  var camera = new Camera();
  scene.add(camera);

  var light = new AmbientLight(0xffffff);
  scene.add(light);

  ////////////////////////////////////////////////////////////////////////////////
  //          handle arToolkitSource
  ////////////////////////////////////////////////////////////////////////////////

  var arToolkitSource = new ArToolkitSource({
      sourceType : 'webcam',
      sourceWidth: 480,
      sourceHeight: 640,
  })

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

  // listener for end loading of NFT marker
  window.addEventListener('arjs-nft-loaded', function(ev){
      console.log(ev);
  })

  function onResize(){
      arToolkitSource.onResizeElement()
      arToolkitSource.copyElementSizeTo(renderer.domElement)
      //if( arToolkitContext.arController !== null ){
          arToolkitSource.copyElementSizeTo(arToolkitContext.arController.canvas)
      //}
  }

  ////////////////////////////////////////////////////////////////////////////////
  //          initialize arToolkitContext
  ////////////////////////////////////////////////////////////////////////////////

  // create atToolkitContext
  var arToolkitContext = new ArToolkitContext({
      detectionMode: 'color',
      labelingMode: 'white_region',
      canvasWidth: 480,
      canvasHeight: 640,
  }, {
      sourceWidth: 480,
      sourceHeight: 640,
  })

  // initialize it
  arToolkitContext.init(function onCompleted(){
      // copy projection matrix to camera
      camera.projectionMatrix.copy( arToolkitContext.getProjectionMatrix() );
  })

  ////////////////////////////////////////////////////////////////////////////////
  //          Create a ArMarkerControls
  ////////////////////////////////////////////////////////////////////////////////

  // init controls for camera
    var markerRoot = new Group();
    scene.add(markerRoot);

  var markerControls = new ArMarkerControls(arToolkitContext, markerRoot, {
      size: 0.2,
      type : 'nft',
      descriptorsUrl : "../src/data/patterns/whalecircles",
      changeMatrixMode: "modelViewMatrix",
      smooth: true,
      smoothCount: 8,
      smoothTolerance: 0.03,
      smoothThreshold: 3
  })


  scene.visible = true

  //////////////////////////////////////////////////////////////////////////////////
  //		add an object in the scene
  //////////////////////////////////////////////////////////////////////////////////

    var container = new Group();
    markerRoot.add(container);

  let geometry1 = new PlaneGeometry(1,1,4,4);
  let loader = new TextureLoader();
  let texture = loader.load( '../src/assets/ar-placeholder.png', render );
  let material1 = new MeshBasicMaterial( { map: texture } );

    mesh1 = new Mesh( geometry1, material1 );
    mesh1.rotation.x = -Math.PI/2;
    //container.add( mesh1 );


    const geometry = new BoxGeometry( 1, 1, 1 );
    const material = new MeshBasicMaterial( { map: texture } );
    const cube = new Mesh( geometry, material );
    container.add(cube)


    function setMarkerPos(nft:Event)
    {
        var nftCE:CustomEvent = nft as CustomEvent;
        var msg = nftCE.detail;
        markerRoot.position.y = (msg.height / msg.dpi * 2.54 * 10) / 2.0 ; //y axis?
        markerRoot.position.x = (msg.width / msg.dpi * 2.54 * 10) / 2.0 ;//x axis?
    }

    //window.addEventListener('arjs-nft-init-data', setMarkerPos)

    container.scale.set(400,20,400);
    //container.position.set(200,50,-200);

  render();
  animate();



  function animate()
  {
      requestAnimationFrame(animate);
      deltaTime = clock.getDelta();
      totalTime += deltaTime;

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
</main>






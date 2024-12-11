<main>
    <div class="arjs-loader">
        <div>Loading, please wait...</div>
    </div>
</main>

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
      Mesh, Clock, AmbientLight
  } from "three";
  import { ArToolkitProfile, ArToolkitSource, ArToolkitContext, ArMarkerControls} from '@ar-js-org/ar.js/three.js/build/ar-threex.js';
  import Main from "./main";

  var scene: Scene, renderer: WebGLRenderer, clock:Clock, deltaTime:number, totalTime:number;
  var camera : Camera;
  var arToolkitSource = new ArToolkitSource();
  var arToolkitContext = new ArToolkitContext();
  var markerRoot1;
  var mesh1;

  init();
  animate();

  function init(){

      scene = new Scene();

      let ambientLight = new AmbientLight( 0xcccccc, 0.5 );
      scene.add( ambientLight );

      camera = new Camera();
      scene.add(camera);

      renderer = new WebGLRenderer({antialias: true, alpha: true});
      renderer.setClearColor(new Color('lightgrey'),0);
      renderer.setSize( 640, 480 );
      renderer.domElement.style.position = 'absolute'
      renderer.domElement.style.top = '0px'
      renderer.domElement.style.left = '0px'
      document.body.appendChild( renderer.domElement );

      clock = new Clock();
      deltaTime = 0;
      totalTime = 0;

      arToolkitSource = new ArToolkitSource({
          sourceType : 'webcam',
      });

      function onResize()
      {
          arToolkitSource.onResize()
          arToolkitSource.copySizeTo(renderer.domElement)
          if ( arToolkitContext.arController !== null )
          {
              arToolkitSource.copySizeTo(arToolkitContext.arController.canvas)
          }
      }

      arToolkitSource.init(function onReady(){
          onResize()
      });

      window.addEventListener('resize', function(){
          onResize()
      });

      arToolkitContext = new ArToolkitContext({
          cameraParametersUrl: 'camera_para.dat',
          detectionMode: 'color'
      });


      arToolkitContext.init( function onCompleted(){
          camera.projectionMatrix.copy( arToolkitContext.getProjectionMatrix() );
      });


      markerRoot1 = new Group();
      scene.add(markerRoot1);
      let markerControls1 = new ArMarkerControls(arToolkitContext, markerRoot1,
          {
              size: 0.16, type:'pattern', patternUrl: "whale1.patt",
          })
      let geometry1 = new BufferGeometry();
      let loader = new TextureLoader();
      let texture = loader.load('assets/ar-placeholder.png', render)
      let material1 = new MeshBasicMaterial({map:texture});

      mesh1 = new Mesh(geometry1, material1);
      mesh1.rotation.x = -Math.PI / 2;

      markerRoot1.add(mesh1);
  }

  function update()
  {
      // update artoolkit on every frame
      if ( arToolkitSource.ready !== false )
          arToolkitContext.update( arToolkitSource.domElement );
  }


  function render()
  {
      renderer.render( scene, camera );
  }


  function animate()
  {
      requestAnimationFrame(animate);
      deltaTime = clock.getDelta();
      totalTime += deltaTime;
      update();
      render();
  }

</script>


<Canvas>
</Canvas>




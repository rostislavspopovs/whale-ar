<main>
    <div class="arjs-loader">
        <div>Loading, please wait...</div>
    </div>
</main>

<script lang="ts">
  import {Canvas} from '@threlte/core'
  import {Camera, Color, Group, Scene, WebGLRenderer} from "three";
  import { ArToolkitProfile, ArToolkitSource, ArToolkitContext, ArMarkerControls} from '@ar-js-org/ar.js/three.js/build/ar-threex.js';

  var scene: Scene, renderer: WebGLRenderer, clock, deltaTime, totalTime;
  var camera : Camera;
  var arToolkitSource = new ArToolkitSource();
  var arToolkitContext = new ArToolkitContext();
  var markerRoot1;
  var mesh1;

  init();
  update();
  render();

  function init(){

      scene = new Scene();
      var camera = new Camera();

      renderer = new WebGLRenderer({antialias: true, alpha: true});
      renderer.setClearColor(new Color('lightgrey'),0);
      renderer.domElement.style.position = 'absolute'
      renderer.domElement.style.top = '0px'
      renderer.domElement.style.left = '0px'
      document.body.appendChild( renderer.domElement );

      arToolkitSource = new ArToolkitSource({
          sourceType : 'webcam',
      });

      arToolkitSource.init();

      arToolkitContext = new ArToolkitContext({
          cameraParametersUrl: 'data/camera_para.dat',
          detectionMode: 'mono'
      });

      arToolkitContext.init( function onCompleted(){
          camera.projectionMatrix.copy( arToolkitContext.getProjectionMatrix() );
      });


      markerRoot1 = new Group();
      scene.add(markerRoot1);
      let markerControls = new ArMarkerControls(arToolkitContext, markerRoot1,
          {
              type: 'pattern', patternUrl: "data/hiro.patt",
          })

  }

  function update(){
      if ( arToolkitSource.ready !== false )
          arToolkitContext.update( arToolkitSource.domElement );
  }
  function render()
  {
      renderer.render( scene, camera );
  }

</script>


<Canvas>
</Canvas>




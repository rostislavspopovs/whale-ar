<script>
    import {DoubleSide, Group, MeshBasicMaterial, Object3D, Vector3} from "three";
    import {InteractionManager} from "three.interactive";
    import 'aframe-extras/loaders/index.js';
    import {WhaleData} from "./WhaleData.js";
    import {Howl, Howler} from 'howler';

    let markerFound = $state(false);
    let markerFoundLf = false;
    let markerFoundPrev = false;

    var patternUrl = $state();

    let whaleAudioClip;

    let {camera, scene, markerDummy, onArFinish} = $props();

    let whaleClicked = $state(false);

    let helpPopup = $state(false);

    console.log("ARScene Script");

    AFRAME.registerComponent("ar-scene-component", {
        init: function () {
            console.log("arScene init");
            console.log(window.arController);
            this.sceneChildren = [];
        },
        tick: function () {
            if (markerFound && !markerFoundLf) {
                this.sceneChildren = this.el.children;
                for (let i = 0; i < this.sceneChildren.length; i++) {
                    if (!markerFoundPrev) {
                        this.sceneChildren[i].dispatchEvent(new CustomEvent('onMarkerFound'));
                    } else {
                        this.sceneChildren[i].dispatchEvent(new CustomEvent('onMarkerFoundAgain'));
                    }
                }
                markerFoundPrev = true;
            } else if (!markerFound && markerFoundLf) {
                this.sceneChildren = this.el.children;
                for (let j = 0; j < this.sceneChildren.length; j++) {
                    this.sceneChildren[j].dispatchEvent(new CustomEvent('onMarkerLost'));
                }
            }

            markerFoundLf = markerFound;
        }
    });

    AFRAME.registerComponent("ground-box", {
        schema: {
            gbOpacity: {default: 0.0}
        },
        init: function () {
            this.mesh = this.el.getObject3D('mesh');
            this.gbOpacity = 0.0;
            this.transparentMaterial = new MeshBasicMaterial({
                transparent: true,
                opacity: 0,
                side: DoubleSide,
                depthWrite: false
            });
            this.gbMaterial = new MeshBasicMaterial({transparent: true, opacity: 0, color: 0x333aff, side: DoubleSide});
            var gbMaterials = [this.gbMaterial, this.gbMaterial, this.transparentMaterial, this.transparentMaterial, this.gbMaterial, this.gbMaterial]
            this.mesh.material = gbMaterials;
        },
        update: function () {
            this.gbMaterial.opacity = this.data.gbOpacity;
        }
    });

    AFRAME.registerComponent("click-to-start", {
        init: function () {
            var obj = this.el.object3D;
            console.log(obj);
            window.interactionManager.add(obj);
            obj.addEventListener('click', () => {
                if(markerFound && !whaleClicked){
                    launchApp()
                    // setTimeout(()=>{whaleAudioClip.play()}, 500);
                }
            })
        }
    });

    const whaleIds = ["sperm-whale","blue-whale","humpback-whale"];
    export const onMarkerFound = (url) => {
        markerFound = true;
        patternUrl = url;
        whaleIds.forEach((whaleId) => {
            document.getElementById(whaleId).setAttribute("visible", false);
            if(whaleId == patternUrl){
                document.getElementById(whaleId).setAttribute("visible", true);
                // whaleAudioClip = new Howl({
                //     src: ['/assets/'+window.whaleXML[whaleId]["audio"]]
                // })
                // setTimeout(()=>{whaleAudioClip.play()}, 500);
            }
        })
    };
    export const onMarkerLost = () => {
        markerFound = false;
    };

    export const startAR = () => {
        setTimeout(() => {
            helpPopup = true;
        }, 10000);
    };

    function closePopup(){
        helpPopup = false;
        startAR();
    }

    function launchApp(){
        whaleClicked = true;
        window.arController.parameters.maxDetectionRate = 0;
        var launchTimeline = AFRAME.ANIME.timeline();
        launchTimeline.add({
            targets: 'video',
            opacity: 0,
            easing: 'easeOutSine',
            duration: 500
        }).add({
            targets: [camera.position],
            x: 0,
            y: 0,
            z: 0,
            easing:"easeOutCubic",
            duration: 1000,
        },0).add({
            targets: [camera.rotation],
            x: 0,
            y: 0,
            z: 0,
            easing:"easeOutCubic",
            duration: 1000,
        },0).add({
            targets: [markerDummy.position],
            x: 1,
            y: -5,
            z: -10,
            easing:"easeOutCubic",
            duration: 1000,
        },0).add({
            targets: [markerDummy.rotation],
            x: 0,
            y: -0.4,
            z: 0,
            easing:"easeOutCubic",
            duration: 1000,
        },0).add({
            targets: [markerDummy.position],
            x: -10,
            y: -5,
            z: -30,
            easing:"easeInQuad",
            duration: 2500,
        },1000).add({
            targets: [markerDummy.rotation],
            x: 0,
            y: -1.5,
            z: 0,
            easing:"easeInQuad",
            duration: 2500,
        },1000);
        setTimeout(onArFinish, 2500);
    }


</script>

<a-entity ar-scene-component id="ar-scene">

    <a-box ground-box id="groundBox"
           scale="1 0.1 1"
           position="0 0 0"
           material="transparent: true, opacity: 0"
           animation__init1opacity="property: ground-box.gbOpacity; to: 1.0; dur:400; easing: easeInCubic; startEvents: onMarkerFound; delay: 0"
           animation__init1scale="property: scale; from: 3 0.1 3; to: 1 0.1 1; dur:400; easing: easeOutCubic; startEvents: onMarkerFound; delay: 0"
           animation__init3opacity="property: ground-box.gbOpacity; from: 1.0; to: 0.0; dur:500; easing: easeInCubic; startEvents: onMarkerFound; delay: 500"
    ></a-box>


    <a-entity id="launchScene"
              position="0 2 0"
              scale="0 0 0"
              rotation="0 0 0"
              animation__init3scale="property: scale; to: 0.6 0.6 0.6; dur:500; easing: easeOutBack; startEvents: onMarkerFound; delay: 500"
              animation__lost1scale="property: scale; to: 0 0 0; dur:200; easing: easeInBack; startEvents: onMarkerLost; delay: 0"
              animation__reinit1scale="property: scale; to: 0.6 0.6 0.6; dur:200; easing: easeOutBack; startEvents: onMarkerFoundAgain; delay: 200"
    >
<!--        <a-entity-->
<!--                  gltf-model="../src/assets/earth.glb"-->
<!--                  position="0 0 0"-->
<!--                  scale="2 2 2"-->
<!--                  rotation="0 0 0"-->
<!--                  animation__rotate="property: rotation; from: 0 0 0; to: 0 -360 0; dur:200000; easing: linear; loop:true"-->
<!--        ></a-entity>-->

        <a-entity id="whaleParent">
            <a-box click-to-start
                   position="0 1 0"
                   scale="6 1.2 1.2"
                   visible="false">
            </a-box>
            <a-entity id="sperm-whale"
                      visible="false"
                      loaded-gltf-model="modelId: sperm-whale-model"
                      animation-mixer
                      position="0 1 0"
                      scale="0.6 0.6 0.6"
                      rotation="0 -90 0"
            >
            </a-entity>
            <a-entity
                    id="blue-whale"
                    visible="false"
                    loaded-gltf-model="modelId: blue-whale-model"
                    animation-mixer
                    position="0 1 0"
                    scale="0.2 0.2 0.2"
                    rotation="0 -90 0"
            >
            </a-entity>
            <a-entity
                    id="humpback-whale"
                    visible="false"
                    loaded-gltf-model="modelId: humpback-whale-model"
                    animation-mixer
                    position="0 0 0"
                    scale="0.2 0.2 0.2"
                    rotation="0 -90 0"
            ></a-entity>
            <a-entity id="audio-waves"
                      visible="true"
                      loaded-gltf-model="modelId: audio-waves"
                      animation-mixer
                      position="0 1 0"
                      scale="1 1 1"
                      rotation="0 -90 0"
            >
            </a-entity>
        </a-entity>
    </a-entity>

</a-entity>

{#if !whaleClicked}
    {#if !helpPopup}
        <div class="notice">
            {#if markerFound}
                <h1>You've discovered the <br>{window.whaleXML[patternUrl]["name"]}!</h1>
                <h2>Tap on the whale to learn more!</h2>
            {:else}
                <div class="scan-line"></div>
                <h2>Point your camera at the stamp on your postcard</h2>
            {/if}
        </div>
    {/if}
    {#if helpPopup && !markerFound}
        <div class="popup">
            <button aria-label="Close panel" onclick={closePopup} style="position: absolute; top: 0px; right: 0px">
                <svg width="30" height="30">
                    <image xlink:href="/assets/close-icon.svg" width="30" height="30"/>
                </svg>
            </button>
            <div style="display:flex">
                <div>
                    <h2>Unable to detect a post card stamp.</h2>
                    <h2>Tap on the globe to skip and go straight to the global map</h2>
                </div>
                <button class="globe-button" onclick={launchApp} aria-label="Launch App">
                    <svg width="100" height="100">
                        <image xlink:href="/assets/globe-button.svg" width="100" height="100"/>
                    </svg>
                </button>
            </div>
        </div>
    {/if}
{/if}



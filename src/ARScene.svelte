<script>
    import {DoubleSide, MeshBasicMaterial} from "three";
    import {InteractionManager} from "three.interactive";
    import 'aframe-extras/loaders/index.js';
    import {WhaleData} from "./WhaleData.js";
    import {Howl, Howler} from 'howler';

    export let interactionManager;

    let markerFound = false;
    let markerFoundLf = false;
    let markerFoundPrev = false;
    let markerFoundTime = 0;

    var patternUrl;

    let whaleAudioClip;

    console.log("ARScene Script");


    AFRAME.registerComponent("ar-scene-component", {
        init: function () {
            console.log("arScene init");
            console.log(window.whaleXML);
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
            console.log(this.data.gbOpacity);
        }
    });

    AFRAME.registerComponent("click-to-start", {
        init: function () {
            interactionManager.add(this.el.object3D);
            this.el.object3D.addEventListener('click', () => {
                console.log("clicked");
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
                whaleAudioClip = new Howl({
                    src: ['../src/assets/'+window.whaleXML[whaleId]["audio"]]
                })
                setTimeout(()=>{whaleAudioClip.play()}, 500);
            }
        })
    };
    export const onMarkerLost = () => {
        markerFound = false;
    };
</script>

<a-entity ar-scene-component>

    <a-entity light="type: hemisphere; color: #ffffff; groundColor: #5e5e5e; intensity: 4"></a-entity>
    <a-entity light="type: ambient; color: #ffffff; intensity: 5"></a-entity>

    <!--        <a-box ground-box id="groundBox"-->
    <!--                scale="1 0.1 1"-->
    <!--                position="0 2 0"-->
    <!--                material="transparent: true, opacity: 0"-->
    <!--                animation__init1opacity="property: ground-box.gbOpacity; to: 1.0; dur:1000; easing: easeInCubic; startEvents: onMarkerFound; delay: 0"-->
    <!--                animation__init1position="property: position; to: 0 0 0; dur:1000; easing: easeOutCubic; startEvents: onMarkerFound; delay: 0"-->
    <!--                animation__init2position="property: position; from: 0 0 0; to: 1.8 0 -1.1; dur:1000; easing: easeOutCubic; startEvents: onMarkerFound; delay: 1000"-->
    <!--                animation__init2scale="property: scale; to: 4.4 0.1 2.9; dur:1000; easing: easeOutCubic; startEvents: onMarkerFound; delay: 1000"-->
    <!--                animation__init3opacity="property: ground-box.gbOpacity; from: 1.0; to: 0.0; dur:1000; easing: easeInCubic; startEvents: onMarkerFound; delay: 1000"-->
    <!--        ></a-box>-->

    <a-box ground-box id="groundBox"
           scale="1 0.1 1"
           position="0 0 0"
           material="transparent: true, opacity: 0"
           animation__init1opacity="property: ground-box.gbOpacity; to: 1.0; dur:400; easing: easeInCubic; startEvents: onMarkerFound; delay: 0"
           animation__init1scale="property: scale; from: 3 0.1 3; to: 1 0.1 1; dur:400; easing: easeOutCubic; startEvents: onMarkerFound; delay: 0"
           animation__init3opacity="property: ground-box.gbOpacity; from: 1.0; to: 0.0; dur:1000; easing: easeInCubic; startEvents: onMarkerFound; delay: 1800"
    ></a-box>


    <a-entity click-to-start id="launchScene"
              position="0 3 0"
              scale="0 0 0"
              rotation="0 45 0"
              animation__init3scale="property: scale; to: 1 1 1; dur:500; easing: easeOutBack; startEvents: onMarkerFound; delay: 1000"
              animation__lost1scale="property: scale; to: 0 0 0; dur:200; easing: easeInBack; startEvents: onMarkerLost; delay: 0"
              animation__reinit1scale="property: scale; to: 1 1 1; dur:200; easing: easeOutBack; startEvents: onMarkerFoundAgain; delay: 200"
    >
<!--        <a-entity-->
<!--                  gltf-model="../src/assets/earth.glb"-->
<!--                  position="0 0 0"-->
<!--                  scale="2 2 2"-->
<!--                  rotation="0 0 0"-->
<!--                  animation__rotate="property: rotation; from: 0 0 0; to: 0 -360 0; dur:200000; easing: linear; loop:true"-->
<!--        ></a-entity>-->

        <a-entity id="whaleParent">
            <a-entity id="sperm-whale"
                      visible="false"
                      gltf-model="../src/assets/sperm-whale.glb"
                      animation-mixer
                      position="0 1 0"
                      scale="0.6 0.6 0.6"
                      rotation="0 -90 0"
            ></a-entity>
            <a-entity
                    id="blue-whale"
                    visible="false"
                    gltf-model="../src/assets/blue-whale.glb"
                    animation-mixer
                    position="0 1 0"
                    scale="0.2 0.2 0.2"
                    rotation="0 -90 0"
            ></a-entity>
            <a-entity
                    id="humpback-whale"
                    visible="false"
                    gltf-model="../src/assets/humpback-whale.glb"
                    animation-mixer
                    position="0 1 0"
                    scale="0.2 0.2 0.2"
                    rotation="0 -90 0"
            ></a-entity>
        </a-entity>
    </a-entity>

</a-entity>

<div class="notice">
    {#if markerFound}
        <h1>You've discovered the <br>{window.whaleXML[patternUrl]["name"]}!</h1>
        <h2>Tap on the whale to learn more</h2>

    {/if}
</div>




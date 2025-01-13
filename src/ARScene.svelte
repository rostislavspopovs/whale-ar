
<script>
        import { DoubleSide, MeshBasicMaterial } from "three";

        AFRAME.registerComponent("groundBox", {
                schema:{
                        gbOpacity:{default: 0.0}
                },
                init: function(){
                        this.mesh = this.el.getObject3D('mesh');
                        this.gbOpacity = 0.0;
                        this.transparentMaterial = new MeshBasicMaterial({ transparent: true, opacity: 0, side: DoubleSide, depthWrite: false});
                        this.gbMaterial = new MeshBasicMaterial({transparent: true, opacity: 0, color: 0x333aff, side: DoubleSide });
                        var gbMaterials = [this.gbMaterial,this.gbMaterial,this.transparentMaterial,this.transparentMaterial,this.gbMaterial,this.gbMaterial]
                        this.mesh.material = gbMaterials;
                },
                update: function() {      
                        this.gbMaterial.opacity = this.data.gbOpacity;
                        console.log(this.data.gbOpacity);
                }
        })
         
</script>

<a-light type="directional" position="10 10 -10" rotation="-90 0 0" target="#directionaltarget">
        <a-entity id="directionaltarget" position="1.8 2 -1.2"></a-entity></a-light>
<a-entity light="type: hemisphere; color: #ffffff; groundColor: #5e5e5e; intensity: 0.4"></a-entity>


<a-entity>
        <a-box groundBox id="groundBox"
                scale="1 0.1 1"
                position="0 2 0"
                material="transparent: true, opacity: 0"
                animation__stage1opacity="property: groundBox.gbOpacity; to: 1.0; dur:2000; easing: easeInCubic; delay: 1000"
                animation__stage1position="property: position; to: 0 0 0; dur:2000; easing: easeOutCubic; delay: 1000"
                animation__stage2position="property: position; from: to: 0 0 0; to: 1.8 0 -1.2; dur:1000; easing: easeOutCubic; delay: 3000"
                animation__stage2scale="property: scale; to: 4.5 0.1 3; dur:1000; easing: easeOutCubic; delay: 3000"
        ></a-box>
</a-entity>

<a-entity
        gltf-model="../src/assets/earth.glb"
        position="1.8 2 -1.2"
        scale="0 0 0"
        material="transparent: true; opacity: 0;"
        animation__stage3scale="property: scale; to: 1 1 1; dur:1000; easing: easeOutCubic; delay: 4000"
></a-entity>




<svelte:head>
    <script src="https://raw.githack.com/AR-js-org/AR.js/master/aframe/build/aframe-ar.js"></script>
</svelte:head>
<script>
    import {onMount} from "svelte";
    import "aframe";

    onMount(() => {

        window.addEventListener('camera-init', (data) => {
            console.log('camera-init', data);
        })

        window.addEventListener('camera-error', (error) => {
            console.log('camera-error', error);
        })

        AFRAME.registerComponent('registerevents', {
            init: function () {
                var marker = this.el;

                marker.addEventListener('markerFound', function() {
                    var markerId = marker.id;
                    console.log('markerFound', markerId);
                    // TODO: Add your own code here to react to the marker being found.
                });

                marker.addEventListener('markerLost', function() {
                    var markerId = marker.id;
                    console.log('markerLost', markerId);
                    // TODO: Add your own code here to react to the marker being lost.
                });
            }
        });
    })
</script>


<a-scene embedded vr-mode-ui="enabled: false;"
         arjs="debug:true; sourceType: webcam; detectionMode: mono; patternRatio: 0.85; sourceWidth: 480; sourceHeight: 640"
         renderer='precision: medium;'>

    <a-marker type="pattern" url="../src/data/patterns/pattern-whale-marker.patt" registerevents>
        <a-box
                scale="0.5 0.5 0.5"
                position="0 0.5 0"
                material="color: red;">
        </a-box>
    </a-marker>

    <a-box
            scale="0.2 0.2 0.2"
            position="-1 -1 -3"
            material="color: red;">
    </a-box>

    <a-entity camera></a-entity>
</a-scene>


<!--<a-scene >-->


<!--    <a-box-->
<!--            scale="0.01 0.01 0.1"-->
<!--            position="0 0 0"-->
<!--            material="color: red;">-->
<!--    </a-box>-->

<!--    <a-entity camera></a-entity>-->

<!--</a-scene>-->

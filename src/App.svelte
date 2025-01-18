<script>
    let appLaunched = $state(false);
    console.log("App Scene");
    export const appInit = () => {
        appLaunched = true;
        let globe = document.querySelector("#globe");
        globe.setAttribute("visible", true);
        AFRAME.ANIME({
            targets: [globe.object3D.position],
            x: 0,
            y: 0,
            z: -6,
            easing: 'easeOutQuart',
            duration: 1500
        });
        AFRAME.ANIME({
            targets: [globe.object3D.scale],
            x: 1,
            y: 1,
            z: 1,
            easing: 'easeOutQuart',
            duration: 1500
        });
        AFRAME.ANIME({
            targets: [globe.object3D.rotation],
            x: 0,
            y: 1,
            z: 0,
            easing: 'easeOutQuart',
            duration: 1500
        })
    };
</script>
<a-entity id="globe"
    gltf-model="../src/assets/earth.glb"
    position="0 0 -6"
    scale="0 0 0"
    rotation="0 0 0"
    visible="false">
</a-entity>
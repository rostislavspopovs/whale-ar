<script context="module">
    import "aframe"
</script>

<svelte:head>
    <script src="https://raw.githack.com/AR-js-org/AR.js/master/aframe/build/aframe-ar.js"></script>
</svelte:head>

<a-scene artoolkit>

    <a-assets>
        <canvas id="myCanvas"></canvas>
    </a-assets>

    <a-marker type="pattern" url="../src/data/patterns/pattern-whale-marker.patt" size="0.15">
        <a-box
                scale="10 10 10"
                position="0 0.5 0"
                material="color: red;">
        </a-box>
    </a-marker>

    <a-entity camera></a-entity>

</a-scene>

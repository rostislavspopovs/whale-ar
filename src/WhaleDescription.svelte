<script lang="ts">

    let whaleSelected = false;
    let whaleSelectedId = "";

    document.addEventListener("whaleSelected", function(event) {
        console.log("WHALE SELECTED: " + event.detail.id)
        whaleSelected = true;
        whaleSelectedId = event.detail.id;
    })
    document.addEventListener("whaleUnselected", function(event) {
        console.log("WHALE UNSELECTED")
        whaleSelected = false;
    })

</script>

<main>
    {#if whaleSelected}
    <div id="whale-description">
        <h2>Whale Selected: {whaleSelectedId}</h2>
    </div>
    {/if}
</main>
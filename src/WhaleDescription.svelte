<script lang="ts">

    import {WhaleData} from "./WhaleData";

    let whaleData = new WhaleData().whales;
    console.log(whaleData);

    let whaleSelected = false;
    let whaleSelectedData = undefined;

    document.addEventListener("whaleSelected", function(event) {
        console.log("WHALE SELECTED: " + event.detail.id)
        whaleSelected = true;
        var whaleSelectedId = event.detail.id;
        whaleSelectedData = whaleData.get(whaleSelectedId);
    })
    document.addEventListener("whaleUnselected", function(event) {
        console.log("WHALE UNSELECTED")
        whaleSelected = false;
    })

</script>

<main>
    {#if whaleSelected}
    <div id="whale-description">
        <h2>Whale Selected: {whaleSelectedData.name}</h2>
    </div>
    {/if}
</main>
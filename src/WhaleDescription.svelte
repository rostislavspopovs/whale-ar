<script lang="ts">

    import {WhaleData} from "./WhaleData";
    var whalesLoaded = false;

    var whaleData;
    async function loadWhaleData(){
        whaleData = await WhaleData.getWhales();
    }
    loadWhaleData().then(_=> {
        whaleData = whaleData["whales"];
        whalesLoaded = true;
    });

    let whaleSelected = false;
    var whaleSelectedId = "";

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
    {#if whalesLoaded && whaleSelected}
    <div id="whale-description">
        <h2>{whaleData[whaleSelectedId]["name"]}</h2>
        <h4>({whaleData[whaleSelectedId]["scientific-name"]})</h4>
        <h3>{whaleData[whaleSelectedId]["description"]}</h3>
    </div>
    {/if}
</main>
let whales = undefined;
let loaded = false;
export class WhaleData{
    constructor(){
        fetch("../src/data/whaleData/whales.json")
            .then(response => response.json())
            .then(json => {
                whales = json;
                loaded = true;
                console.log(whales);
            });
    }
    get whales(){
        return whales;
    }
}
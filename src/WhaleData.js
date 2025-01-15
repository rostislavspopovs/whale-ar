let loaded = false;
export class WhaleData{
    static async getWhales()
    {
        const whales = await fetch("../src/data/whaleData/whales.json")
            .then(response => response.json())
            .then(json => {
                loaded = true;
                return json;
            });
        return new WhaleData(whales);
    }
    constructor(whales){
        this.whales = whales;
    }
}
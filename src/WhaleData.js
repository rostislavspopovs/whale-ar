
export class WhaleData{
    static var whaleData;
    static async getWhales()
    {
        const whales = await fetch("../src/data/whaleData/whales.json")
            .then(response => response.json())
            .then(json => {
                return json;
            });
        return new WhaleData(whales);
    }
    constructor(){
        whaleData = getWhales();
    }
}
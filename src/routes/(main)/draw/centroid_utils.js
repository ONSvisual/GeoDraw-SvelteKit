
export class GetCentroids {
    constructor(filename) {

        this.init(filename)
        

    }

    async init(filename){
        this.file = filename;
        
        var data = await dfd.readCSV(this.file);
        console.log(data.print())

    }




  };





// Object.fromEntries(a.$index.map((_, i) => [_, a.$data[i]]))

console.error('cct')




class KeyTable{
    constructor()
    {
        this.Values = {};
        this.Act = {};
        this.Rec={};
        // this.keys = [];
    }
    
    findKey(key){
        if(this.Values.hasOwnProperty(key))
            return true
        return false
    }
    addValue(key,value)
    {
        if(!this.Values.hasOwnProperty(key))
        {
            this.Values[key] = {};
            // this.keys.push(key);
        }
        this.Values[key] = value;
    }
    getValue(key){
        if(this.Values.hasOwnProperty(key) && this.Values[key])
            return this.Values[key];
        }
    removeKey(key)
    {
        if(this.Values.hasOwnProperty(key) && this.Values[key])
        {
            delete this.Values[key];
            // console.log(`${this.keys.indexOf(key)-1}, ${this.keys.indexOf(key)} `)
            // this.keys.splice(this.keys.indexOf(key)-1,1);
        }
    }

    findAct(key){
        if(this.Act.hasOwnProperty(key))
            return true
        return false
    }
    addAct(key,value)
    {
        if(!this.Act.hasOwnProperty(key))
        {
            this.Act[key] = {};
            // this.keys.push(key);
        }
        this.Act[key] = value;
    }
    getAct(key){
        if(this.Act.hasOwnProperty(key) && this.Act[key])
            return this.Act[key];
        }
    removeAct(key)
    {
        if(this.Act.hasOwnProperty(key) && this.Act[key])
        {
            delete this.Act[key];
            // console.log(`${this.keys.indexOf(key)-1}, ${this.keys.indexOf(key)} `)
            // this.keys.splice(this.keys.indexOf(key)-1,1);
        }
    }

    findRec(key){
        if(this.Rec.hasOwnProperty(key))
            return true
        return false
    }
    addRec(key,value)
    {
        if(!this.Rec.hasOwnProperty(key))
        {
            this.Rec[key] = {};
            // this.keys.push(key);
        }
        this.Rec[key] = value;
    }
    getRec(key){
        if(this.Rec.hasOwnProperty(key) && this.Rec[key])
            return this.Rec[key];
        }
    removeRec(key)
    {
        if(this.Rec.hasOwnProperty(key) && this.Rec[key])
        {
            delete this.Rec[key];
            // console.log(`${this.keys.indexOf(key)-1}, ${this.keys.indexOf(key)} `)
            // this.keys.splice(this.keys.indexOf(key)-1,1);
        }
    }


}
module.exports.KeyTable = KeyTable;
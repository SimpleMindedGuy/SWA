class KeyTable{
    constructor()
    {
        this.Values = {};
        this.Act = [];
        this.Rec=[];
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
        if(this.Act.includes(key))
            return true
        return false
    }
    addAct(key)
    {
        if(!this.Act.includes(key))
        {
            this.Act.push(key);
            // this.keys.push(key);
        }
    }

    findRec(key){
        if(this.Rec.includes(key))
            return true
        return false
    }
    addRec(key,)
    {
        if(!this.Rec.includes(key))
        {
            this.Rec.push(key);
            // this.keys.push(key);
        }
    }
    

}
module.exports.KeyTable = KeyTable;
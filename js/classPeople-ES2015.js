'use strict';
class RealNode {
    /**
     * 
     * @param {{
     * symbol?: any,
     * info?: {} | undefined,
     * self?: {} | undefined,
     * key?: any,
     * value?: any,
     * checkSet?: (value: any)=>Boolean,
     * get?: ()=>any,
     * react?: ()=>void
     * }} param0 
     * @param  {...RealNode} contactRealNodes 
     */
    constructor({ symbol, info, self, key, value, checkSet, get, react } = {}, ...contactRealNodes) {
        if (!new.target) throw new Error('=> Need "new" before !');
        this.constructorCheck(this, { info, self, key, checkSet, get, react });
        this.id = Symbol(symbol);
        this.contactRealNodes = [];
        this.value = self?.[key];
        this.appear();
        RealNode.makeContact([this], contactRealNodes);
        this.set(value ?? this.self?.[this.key]);
    }
    static Person =  class Person{
        /**
         * 
         * @param {{string: RealNode}} realNodeListObj 
         */
        constructor(realNodeListObj){
            var i = (realNodeListObj = Object.entries(realNodeListObj)).length;
            while(i --> 0){
                const id = realNodeListObj[i][1]?.id ?? realNodeListObj[i][1];
                if(!RealNode.get(id)) throw new Error('=> Can not find RealNode: realNodes['+i+']');
                this[realNodeListObj[i][0]] = id;
            }
        }
        /**
         * 
         * @returns {RealNode}
         */
        search(key){
            const realNode = RealNode.get(this[key]);
            if(realNode) return realNode; else throw new Error('=> Can not find RealNode: this['+key+']');
        }
        toEntries(){
            // return Object.entries(this).reduceRight((n,entry,i,arr)=>(entry[1] = RealNode.get(entry[1]).get(),i || arr),0);
            for(var arr = Object.entries(this),i = arr.length;i --> 0;){arr[i][1] = RealNode.get(arr[i][1]).get();}
            return arr;
        }
        toObj(){
            // return Object.keys(this).reduce((obj,key)=>(obj[key] = RealNode.get(this[key]).get(),obj),{});
            for(var obj = {},keys = Object.keys(this);0 !== keys.length;){obj[keys[keys.length - 1]] = RealNode.get(keys.pop()).get();}
            return obj;
        }
        /**
         * 
         * @returns {Boolean}
         */
        set(key,value,fixMode = false){
            var realNode = this.search(key);
            return realNode.set(value,false,fixMode) && (Object.values(this).forEach(this.react,realNode),true);
        }
        /**
         * 
         * @param {Symbol} id 
         * @param {*} i 
         * @param {Symbol[]} realNodeIDs 
         * @param {RealNode} thisArg 
         * @returns {Boolean | never}
         */
        react(id,i = -1,realNodeIDs,thisArg = this){
            if(0 > i){
                if(Symbol !== id?.constructor) throw new Error('=> "id" must be Symbol !');
                if(typeof realNodeIDs[Symbol.iterator] !== 'function') throw new Error('=> "realNodeIDs" must be ArrayLike !');
                if(!(this instanceof RealNode || thisArg instanceof RealNode)) throw new Error('=> Either this or "thisArg" must be RealNode !');
            }
            return this instanceof RealNode
            ? realNodeIDs.includes(id) && (this.contactRealNodes.includes(id) || RealNode.get(id).react?.(this))
            : this.react.call(thisArg,key,0,realNodeIDs,thisArg);
        }
        /**
         * 
         * @param {Boolean} fixMode 
         * @returns {Promise<Boolean>}
         */
        thenSet(key,value,fixMode){
            RealNode.resolveVoid.then(()=>this.search(key)).then(realNode=>realNode.set(value,fixMode),errorThrow);
        }
        get(key){return this.search(key).get();}
        fix(key){this.search(key).fix();}
    };
    static resolveVoid = Promise.resolve();
    static sys = new Map();
    /**
     * 
     * @param {Symbol} id 
     * @returns {RealNode | undefined}
     */
    static get(id){return this.sys.get(id);}
    /**
     * 
     * @param {(RealNode | Symbol)[]} realNodes 
     * @param {(RealNode | Symbol)[]} contactRealNodes 
     */
    static makeContact(realNodes,contactRealNodes){
        if(typeof realNodes[Symbol.iterator] !== 'function') throw new Error('=> "realNodes" must be ArrayLike !');
        if(typeof contactRealNodes[Symbol.iterator] !== 'function') throw new Error('=> "contactRealNodes" must be ArrayLike !');
        realNodes = realNodes.slice(),contactRealNodes = contactRealNodes.slice();
        var i = realNodes.length,j;
        while(i --> 0){
            if(!(realNodes[i] instanceof RealNode) && Symbol !== realNodes[i]?.constructor){
                throw new Error('=> All items in "realNodes" must be RealNode or Symbol !');
            }
            if(!((realNodes[i] = RealNode.get(realNodes[i].id ?? realNodes[i])) instanceof RealNode)) throw new Error('=> Wrong RealNodeID: realNodes['+i+']');
            j = contactRealNodes.length;
            while(j --> 0){
                if(!(contactRealNodes[j] instanceof RealNode) && Symbol !== contactRealNodes[j]?.constructor){
                    throw new Error('=> All items in "contactRealNodes" must be RealNode or Symbol !');
                }if((realNodes[i].id ?? realNodes[i]) === (contactRealNodes[j] = contactRealNodes[j].id ?? contactRealNodes[j])){throw new Error(
                    `=> Wrong RealNode in both "realNodes" and "contactRealNodes" !\n    realNodes[${i}] contactRealNodes[${j}]`
                );}
                realNodes[i].contactRealNodes.includes(contactRealNodes[j]) || realNodes[i].contactRealNodes.push(contactRealNodes[j]);
            }
        }
        return realNodes;
    }
    /**
     * 
     * @param {{}} thisArg 
     * @param {{
     * info?: {} | undefined,
     * self?: {} | undefined,
     * key?: any,
     * checkSet?: (value: any)=>Boolean,
     * get?: ()=>any,
     * react?: ()=>void
     * }} param1 
     */
    constructorCheck(thisArg,{info,self,key,checkSet,get,react}){
        if(info instanceof Object) thisArg.info = info;
        else if(void 0 !== info) throw new Error('=> "info" must be Object !');
        if(self instanceof Object){
            if(key === this.key) throw new Error('=> Please set another "key" !');
            else thisArg.self = self,thisArg.key = key;
        }else if(void 0 !== self) throw new Error('=> "self" must be Object !');
        if(checkSet instanceof Function) thisArg.checkSet = checkSet;
        else if(void 0 !== checkSet) throw new Error('=> "checkSet" must be Function !');
        if(get instanceof Function) thisArg.get = get;
        else if(void 0 !== get) throw new Error('=> "get" must be Function !');
        if(react instanceof Function) thisArg.react = react;
        else if(void 0 !== react) throw new Error('=> "react" must be Function !');
        return thisArg;
    }
    get(){return this.value;}
    checkSet(){return true;}
    /**
     * 
     * @returns {Number}
     */
    notify(){
        var i = this.contactRealNodes.length;
        while(i --> 0){
            try{RealNode.get(this.contactRealNodes[i]).react?.(this);}
            catch(e){console.error('=> Can not find RealNode: '+String(this.contactRealNodes[i]));}
        }
        return i;
    }
    /**
     * 
     * @returns {Boolean}
     */
    checkSelf(){return !this.self || this.value === this.self[this.key];}
    fix(){this.checkSelf() || (this.self[this.key] = this.value);}
    /**
     * 
     * @param {any} value 
     * @param {Boolean} fixMode 
     */
    thenSet(value,fixMode){return RealNode.resolveVoid.then(()=>this.set(value,fixMode));}
    /**
     * 
     */
    set(value,reactMode = true,fixMode = false){
        const i = value !== this.value && this.checkSet(value) &&
        (this.value = value,this.checkSelf() || (this.self[this.key] = value),reactMode && this.react?.(),this.notify());
        return fixMode && this.fix(),-1 === i;
    }
    /**
     * 
     * @param {{
     * key?: any,
     * checkSet?: (value: any)=>Boolean,
     * get?: ()=>any,
     * react?: ()=>void
     * }} param0 
     * @param  {...RealNode} contactRealNodes 
     */
    callPartner({symbol,info,key,checkSet,get,react} = {},...contactRealNodes){
        return new RealNode(this.constructorCheck(
            {},{symbol,info,self: this.self,key,checkSet,get,react},{value: this.self?.[key]}
        ),...contactRealNodes);
    }
    appear(){RealNode.sys.set(this.id,this);}
    disappear(){return RealNode.sys.delete(this.id);}
}
Object.assign(Object.assign(RealNode,{
}).prototype,{
});
Object.assign(RealNode.Person.prototype,{
});

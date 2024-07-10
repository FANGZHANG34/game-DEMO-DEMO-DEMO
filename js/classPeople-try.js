const any = 'any';
const RealNode = {
    info: {},
    self: {},
    key: any,
    checkSet(value){return true;},
    get(){return this.value;},
    react(realNode = "new RealNode"){return any;},
    id: Symbol(),
    contactRealNodes: [Symbol()],
    value: any,
    /**
     * 
     * @param {{}} thisArg 
     * @param {{
    * info?: {} | undefined,
    * info?: {} | undefined,
    * self?: {} | undefined,
    * key?: any,
    * checkSet?: (value: any)=>Boolean,
    * get?: ()=>any,
    * react?: ()=>void
    * }} param1 
    * @param  {...RealNode} contactRealNodes 
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
   },
   get(){return this.value;},
   checkSet(){return true;},
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
   },
   /**
    * 
    * @returns {Boolean}
    */
   checkSelf(){return !this.self || this.value === this.self[this.key];},
   fix(){this.checkSelf() || (this.self[this.key] = this.value);},
   /**
    * 
    * @param {any} value 
    * @param {Boolean} fixMode 
    */
   thenSet(value,fixMode){return RealNode.resolveVoid.then(()=>this.set(value,fixMode));},
   set(value,reactMode = true,fixMode = false){
       const i = value !== this.value && this.checkSet(value) &&
       (this.value = value,this.checkSelf() || (this.self[this.key] = value),reactMode && this.react?.(),this.notify());
       return fixMode && this.fix(),-1 === i;
   },
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
   },
   appear(){RealNode.sys.set(this.id,this);},
   disappear(){return RealNode.sys.delete(this.id);}
};
RealNode
const metierGrowthArray = {
    普通:{HP: 300,MP: 100,HP_R: 300,MP_R: 100,AD: 10,AP: 0,C_AD: 10,C_AP: 0,AGI: 1},
    战士:{HP: 300,MP: 100,HP_R: 300,MP_R: 100,AD: 10,AP: 0,C_AD: 10,C_AP: 0,AGI: 1}
};
class Strength{
    metier = undefined; LV = 0; EX = 0; R_EX = 0;
    HP = undefined; MP = undefined; HP_R = undefined; MP_R = undefined;
    AD = undefined; AP = undefined; C_AD = undefined; C_AP = undefined;
    AGI = undefined; arms = undefined; armor = undefined; prop = undefined;
    condition = {};buffArray = []; debuffArray = []; skillArray = {};
    BG = undefined;
    fixStrength(){
        const growRateArray = metierGrowthArray[this.metier ??= '普通'],temp = {};
        for(let key in growRateArray){this[key] = this.f1(temp[key]);}
    }
    f1(growRate){
        return growRate * this.LV;
    }
    getRealStrength(){
        const temp = Object.assign({},this);
        for(let buff of this.buffArray){
            buff = objectArrayUT.buffArray.get(buff);
            for(let strengthKey in temp){
                temp[strengthKey] += buff[strengthKey]?.(this[strengthKey]) ?? buff[strengthKey] ?? 0;
            }
        }
        for(let debuff of Object.values(this.debuffArray)){
            debuff = objectArrayUT.buffArray.get(debuff);
            for(let strengthKey in temp){
                temp[strengthKey] += debuff[strengthKey]?.(this[strengthKey]) ?? debuff[strengthKey] ?? 0;
            }
        }
        return temp;
    }
    constructor(StrengthLikeArray){for(let key in StrengthLikeArray){this[key] = StrengthLikeArray[key];}this.fixStrength();}
}
class Buff{
    constructor(strengthKey_fn_Object){
        Object.assign(this,strengthKey_fn_Object);
        for(let key in this){
            var temp = this[key];
            temp instanceof Function || temp > 0 || temp < 0 || (this[key] = undefined);
        }
    }
}
const objectArrayUT = {characterArrayUT: new Map(),buffArray: new Map(),debuffArray: new Map()};
objectArrayUT.characterArrayUT.set(0,{
    metier: '普通',LV: 10
})
.forEach(function(value,key){
    Object.assign(objectArray.characterArray.get(this[key] = key),{strength:new Strength(value)});
},objectArrayUT.characterArrayUT.list = []);
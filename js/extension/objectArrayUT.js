const metierGrowthArray = {
    _:['_HP','_MP','_HP_R','_MP_R','_AD','_AP','_C_AD','_C_AP','_AGI'],
    普通:{_HP: 300,_MP: 100,_HP_R: 300,_MP_R: 100,_AD: 10,_AP: 0,_C_AD: 10,_C_AP: 0,_AGI: 1},
    战士:{_HP: 300,_MP: 100,_HP_R: 300,_MP_R: 100,_AD: 10,_AP: 0,_C_AD: 10,_C_AP: 0,_AGI: 1}
};
class Strength{
    constructor(StrengthLikeArray){for(let key in StrengthLikeArray){this[key] = StrengthLikeArray[key];}this.fixStrength();}
    metier; LV = 0; EX = 0; R_EX = 0;
    condition = {};buffArray = []; debuffArray = []; skillArray = {};
    arms; armor; prop; BG;
    _HP; _MP; _HP_R; _MP_R;
    _AD; _AP; _C_AD; _C_AP;
    _AGI;
    fixStrength(){
        const growRateArray = metierGrowthArray[this.metier ??= '普通'];
        for(let key in growRateArray){this[key] = this.f1(growRateArray[key]);}
    }
    f1(growRate){
        return growRate * this.LV;
    }
    getRealStrength(){
        const temp = Object.assign({},this);
        var key;
        for(let buff of this.buffArray){
            buff = arrayUT.buffArray.get(buff);
            for(let strengthKey in temp){
                metierGrowthArray._.includes(key = '_'+strengthKey) || (key = strengthKey);
                temp[key] += buff[strengthKey]?.(this[strengthKey]) ?? buff[strengthKey] ?? 0;
            }
        }
        for(let debuff of Object.values(this.debuffArray)){
            debuff = arrayUT.buffArray.get(debuff);
            for(let strengthKey in temp){
                metierGrowthArray._.includes(key = '_'+strengthKey) || (key = strengthKey);
                temp[key] += debuff[strengthKey]?.(this[strengthKey]) ?? debuff[strengthKey] ?? 0;
            }
        }
        return temp;
    }
}
class Buff{
    constructor(strengthKey_fn_Object){
        var temp;
        for(let key in strengthKey_fn_Object){
            ((temp = strengthKey_fn_Object[key]) instanceof Function || temp > 0 || temp < 0) && (this[key] = temp);
        }
    }
}
const arrayUT = {characterArrayUT: new Map(),buffArray: new Map(),debuffArray: new Map()};
{
    arrayUT.characterArrayUT.set(0,{
        metier: '普通',LV: 10
    })
    .forEach(function(value,key){
        Object.assign(objectArray.characterArray.get(this[key] = key),{strength:new Strength(value)});
    },arrayUT.characterArrayUT.list = []);
}
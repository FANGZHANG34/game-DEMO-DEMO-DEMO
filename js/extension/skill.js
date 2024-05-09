const skillArray = new Map();
class Skill{
    constructor(B_D_F_Object){
        var temp;
        this.type = B_D_F_Object.type ?? '体';
        ((temp = B_D_F_Object.fn) instanceof Function) && (this.fn = temp);
        ((temp = B_D_F_Object.buffArray) instanceof Array) && (this.buffArray = temp);
        ((temp = B_D_F_Object.debuffArray) instanceof Array) && (this.debuffArray = temp);
    }
    type; fn; buffArray = []; debuffArray = [];
}
{
    skillArray.set('普攻',new Skill({
        type: '体',
        fn(subjectID,objectID){}
    }))
    .forEach(function(value,key){
        var type = value.type;
        this[type] ? this[type].push(key) : this[type] = [key];
    },skillArray.list = {});
}
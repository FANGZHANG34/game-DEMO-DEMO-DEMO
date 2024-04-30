const skillArray = new Map();
skillArray.set('普攻',{
    class: '体',
    level: undefined,
    onEvent(subjectID,objectID){}
})
.forEach(function(value,key){
    this[value.class] ? this.class.push(key) : this.class = [key];
},skillArray.list = {});
const skillArray = new Map();
skillArray.set('普攻',{
    class: '体',
    onEvent(subjectID,objectID){}
})
.forEach(function(value,key){
    var temp = value.class;
    this[temp] ? this[temp].push(key) : this[temp] = [key];
},skillArray.list = {});
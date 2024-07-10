'use strict';
// makeClass = ((tempFn,tempObj)=>
//     (className,instanceObj)=>
//         [String,Symbol].includes(className?.constructor) && instanceObj instanceof Object ? (
//             tempFn(instanceObj,tempObj = {constructor: {},method: {},initAttr: {}}),
//             Object.assign(
//                 (window[className] = function(newObj = tempObj.constructor){
//                     Object.assign(this,tempObj.initAttr,tempObj.constructor,newObj)
//                 }).prototype,
//                 tempObj.method
//             ),
//             console.log(className,window[className]),
//             window[className]
//         ) : console.error('')
// )((instanceObj,tempObj)=>{
//     for(var [key,value] of Object.entries(instanceObj)){
//         const {constructor,method,initAttr} = tempObj;
//         switch(value?.constructor){
//             case undefined:constructor[key] = undefined;break;
//             case Function:method[key] = value;break;
//             default:initAttr[key] = value;
//         }
//     }
// });
String.prototype.toDom = (template=>
    function(){template.innerHTML = this; return template.content.firstElementChild;}
)(document.createElement('template'));

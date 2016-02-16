"use strict";


module.exports = function(_) {
  _.mixin({
    pluralize: require('pluralize'),
    uuid: require('node-uuid'),
    emailFormat: function(type, obj) {
     switch (type) {
       case 'greet':
         var name = _.get(obj, 'profile.displayName') || _.get(obj, 'username', '');

         return name.length ? name : 'Hey';
         break;
     }

     return obj; 
    }
  });
};

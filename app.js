var app = angular.module('plunker', ['ui']);

function Choice(name, children) {
  this.name = name;
  this.checked = false;
  this.children = children || [];
}

var apparel = new Choice('Apparel', [
  new Choice('Mens Shirts', [
    new Choice('Mens Special Shirts')
  ]),
  new Choice('Womens Shirts'),
  new Choice('Pants')
]);
var boats = new Choice('Boats');

app.controller('MainCtrl', function($scope) {
  $scope.myTree = [apparel, boats];
});

app.directive('choiceTree', function() {
      return {
        template: '<ul><choice ng-repeat="choice in tree"></choice></ul>',
        replace: true,
        transclude: true,
        restrict: 'E',
        scope: {
          tree: '=ngModel',
          withchildren: '=withchildren',
          singleselect: '=singleselect'
        },
        compile: function compile(tElement, tAttrs, transclude) {
          return {
            pre: function preLink(scope, iElement, iAttrs, controller) {},
            post: function postLink(scope, iElement, iAttrs, controller) {
              console.log(scope);
              scope.choiceClass = function(choice){
                  return choice.show?"ui-show":"ui-hide";
              };
            }
          };
        }
      };
});

app.directive('choice', function($compile) {
  var link = function(scope, elm, attrs) {
    scope.nodeicon = function(nr){
        var c;
        if(nr>0){
          c = "dynatree-expander";
          // http://plunker.no.de/edit?live=preview
        } else {
          c = "dynatree-connector";
        }
        
        return c;
    };
    scope.choiceClicked = function(choice) {
      choice.checked = !choice.checked;
      var choiceorig = choice.checked;
      function unselectAll(c) {
        choice.checked = false;
        var parent;
        if(scope.$parent) parent = scope.$parent;
        while(parent.$parent.tree || parent.$parent.choice) parent = parent.$parent;
        angular.forEach(parent.tree, function(c) {
          c.checked = false;
          checkChildren(c);
        });
      }
      function checkChildren(c) {
        angular.forEach(c.children, function(c) {
          c.checked = choice.checked;
          checkChildren(c);
        });
      }
      if(scope.withchildren === true) {
        if(scope.singleselect === true) {
          unselectAll(choice);
          choice.checked = choiceorig;
        }
        checkChildren(choice);
      }
      if(scope.singleselect === true && !scope.withchildren === true) {
        unselectAll(choice);
        choice.checked = choiceorig;
      }
    };
    scope.choiceShowHide = function(choice){
      choice.show = !choice.show;
    };

    //Add children by $compiling and doing a new choice directive
    if (scope.choice.children.length > 0) {
      var childChoice = $compile('<choice-tree ng-model="choice.children" withchildren="withchildren" singleselect="singleselect" ng-class="choiceClass($parent.choice)"></choice-tree>')(scope, function(clonedElement, scope) {
        elm.find('li').append(clonedElement);
      });
    }
  };

  return { 
    restrict: 'E',
    //In the template, we do the thing with the span so you can click the 
    //text or the checkbox itself to toggle the check
    // http://jsfiddle.net/3N5y9/2/
    template: '<li>' +
      '<span ng-class="{\'dynatree-exp-edl\': choice.show}"><span ng-click="choiceShowHide(choice);" ng-class="nodeicon(choice.children.length)"></span>'+
        '<input type="checkbox" ng-checked="choice.checked" ng-click="choiceClicked(choice)"> {{choice.name}}' +
    '</span></li>',
    transclude: true,
    compile: function compile(tElement, tAttrs, transclude) {
      return {
        pre: function preLink(scope, iElement, iAttrs, controller) {},
        post: link
      };
    }
  };
});


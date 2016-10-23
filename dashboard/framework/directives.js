/**
 * 只允许数字、英文、下划线和点
 */
framework.angular.directives.directive("onlyEnglish", function () {
    return {
        require : 'ngModel',
        link : function(scope, elm, attrs, ctrl) {
            var ONLYENGLISH_REGEX = /^[0-9a-zA-Z\-_\.]*$/;

            ctrl.$parsers.unshift(function(viewValue) {
                if (ONLYENGLISH_REGEX.test(viewValue)) {
                    ctrl.$setValidity('english', true);
                    return viewValue;
                } else {
                    ctrl.$setValidity('english', false);
                    return viewValue;
                }
            });

            // add a formatter that will process each time the value is updated on the DOM element.
            ctrl.$formatters.unshift(function (value) {
                if(!ONLYENGLISH_REGEX.test(value)){
                    ctrl.$setValidity('english', false);
//                    elm.parent().parent().addClass('error');
                    return value;
                }
                // return the value or nothing will be written to the DOM.
                return value;
            });
        }
    };
});
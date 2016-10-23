framework.angular.controllers.controller("griddemoCtrl",
['$scope', '$rootScope',function($scope, $rootScope) {
	var url = framework.getFinalURL('/admin/admin/modules/welcome/api/demo.json', './api/demo.json');
	$scope.gridUrl = url;
	$rootScope.loading = false;
	
	$scope.handlebar_Renderer = function(dataItem){
		console.log('handlebar_Renderer',dataItem)
		var result = '<a href="admin_edit.shtml?id='+ dataItem.Id +'" class="icon-pencil" title="查看">查看</a>';
		return result;
	}
}])
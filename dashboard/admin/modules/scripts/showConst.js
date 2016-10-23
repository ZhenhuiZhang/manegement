/**
 * 本文件专门处理各种数据模型中的状态字段转换为可换文本
 */
var users = {
	anchor_live: {
		"11": 'live',
		"12": 'line',
		"13": 'off live',
	},
	anchor_status: {
		"1": 'bottom',
		"2": 'hidden',
		"3": 'ban',
	}
}
function UsersModel(prot, val) {
    if(users[prot] && users[prot][val])	
		return users[prot][val]
	else
		return val
}
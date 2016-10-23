/**
 * DEBUG环境
 */

/**
 * 时间戳。一般用于不希望URL加载时有缓存的场景
 * @type {Date}
 * @private
 */
var _curTime = (new Date()).valueOf();

/**
 * 标识当前系统运行于何种模式，IS_DEBUG=false，即发布模式 ；IS_DEBUG=true，即DEBUG模式。
 * @type {boolean}
 */
var IS_DEBUG = false;
/**
 * UI系统中调用API数据的前缀地址，如:  http://127.0.0.1:8000/ 或 /
 * @type {string}
 */
var API_PATH_PREFIX = "/api/";
var API_PATH_PREFIX_DEBUG = "/api/";

/**
 * 系统登录页地址
 * @type {string}
 */
var LOGIN_PAGE = '/dashboard/admin/login.html';

/**
 * API的签名密钥
 */
var API_SECRET_KEY = '';        //签名KEY

/**
 * 图片上传服务
 */
var IMG_UPLOAD_SERVER =  'http://52.77.95.9:5501/upload';

/**
 * 图片服务器域名
 */
var IMG_SERVER = 'http://52.77.95.9:5501';

/**
 * 聊天服务地址
 */
var CHAT_DISPATCHER_URL = 'http://52.77.95.9:8290';

/**
 * 聊天服务地址（最新使用的）
 */
var CHAT_DISP_URLS = ['http://52.77.95.9:8290', 'http://52.77.95.9:8290'];

/**
 * 国家列表
 */
var COUNTRY_LIST = ['Indonesia','Malaysia','Vietnam','Thailand']
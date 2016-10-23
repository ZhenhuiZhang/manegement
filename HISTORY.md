#Change logs

##20161017 @zhenhui
>1. 新增 周榜配置详情页和列表页

##20161017 @zhenhui
>1. 新增 medal详情页和列表页

##20161014 @zhenhui
>1. 新增 splash闪屏推荐编辑，列表页面

##20161012 @jinrong
>1. 新增 live logs报表搜索新增location字段
2. bugfix livelogs日报表按日拆分没有加上location字段
3. 完成 时区切换功能

##20161011 @jinrong
>1. 新增 debug模式下不发送报表的警告邮件

##20161009 @jinrong 
>1. 新增 报表定时任务执行失败时，邮件通知

##20161008 @jinrong 
>1. 新增 live_logs报表新增fans、gift_revenue_history字段
2. 新增 live_logs报表导出新增fans、gift_revenue_history字段

##20161001 @jinrong 
>1. 取消 读取分享日志 定时任务

##20161001 @linwl
>1. 新增 主播edit页增加fit_in_location复选框列表

##20160929 @jinrong
>1. 更新 分享数据定时任务逻辑

##20160929 @zhenhui
>1. push 修改推送时主播不在线时的查找人气主播代替，
2.根据不同集群用不同推送配置
3.添加定时推送

##20160928 @linwl
>1. 删除 anchor_detail页的live状态修改

##20160928 @jinrong 
>1. 修改 报表下载逻辑
2. 更新 按国家维度生成报表

##20160924 @jinrong
>1. bugfix 报表导出功能

##20160923 @jinrong
>1. 新增 share表增加source字段

##20160926 @zhenhui
>1. 添加员工充值和回收，赠送金额，运营充值接口在finance中

##20160923 @zhenhui
>1. 修复CMS所有grid列表的保存搜索项状态功能（所有搜索项增加ng-model属性）
2. 右上角搜索改为搜主播ID、或用户名

##20160921 @jinrong
>1. 新增 share 表，记录直播间分享
2. 新增 用户分享数据定时任务（从lgs日志获取数据）

##20160922 @jinrong
>1. 修改 CMS最大占用内存为1024M
2. 新增 push 表 locations、platforms字段


##20160921 @linwl
>1. 新增 服务器端校验权限时，增加location字段权限校验
2. 优化 修复主播列表的搜索项状态保存功能
3. 优化 调整admins菜单项，移动到permission栏中

##20160920 @jinrong
>1. 新增 livelogs报表每天更新官方主播的资料

##20160919 @jinrong
>1. 新增 编辑官方主播权限及独立页面
2. 新增 cms编辑官方主播接口
3. 新增 权限扫描入口（module列表页）

##20160919 @镇辉
>1. 增加publish是所有配置的version的更新

##20160918 @jinrong
>1. 完善 时区切换功能

##20160918 @镇辉
>1. 新增 配置项升级gift_version按钮

##20160918 @jinrong
>1. 新增 配置项初始化脚本

##20160917 @linwl
>1. 优化 构建逻辑，集群配置使用make发布

##20160914 @jinrong
>1. 新增 topBanner 和 anchor Recommand 页新增locations字段

##20160914 @jinrong 
>1. BUGFIX livelogs报表生成失败

##20160910 @jinrong
>1. 新增 livelogs报表自动导出功能，每天导出当月1号到前一天的数据(目标文件夹：dashboard/report/)

##20160909 @jinrong 
>1. 优化报表导出逻辑，可导出所有用户的数据

##20160909 @jinrong
>1. 新增 所有列表的时间的时区切换功能

##20160908 @jinrong
>1. 新增 时区切换功能
2. 目前已实现搜索带上时区功能，其他显示的时区切换功能未实现

##20160906 @jinrong 
>1. BUGFIX 新增礼物不选国家时把location字段删除

##20160905 @linwl
>1. 新增 集群配置

##20160905 @jinrong 
>1. 新增 livelogs报表自动导出功能，每天导出当月1号到前一天的数据(dashboard/report/report.csv)
2. BUGFIX 下载的报表数据乱码

##20160904 @jinrong
>1. 修改 添加礼物时新增location字段

##20160902 @jinrong 
>1. 新增 new fans rank 新增粉丝数排行榜逻辑

##20160831 @jinrong
>1. 优化 clearFCM 的逻辑

##20160829 @jinrong
>1. 修改 payItem导出格式去掉Username字段

##20160827 @jinrong
>1. 修改 live logs 报表跨日直播的数据按日拆分

##20160825 @jinrong
>1. 新增 pay items下载功能
2. 修改 livelogs报表 取消过滤小于1分钟的数据
3. 新增 管理员修改密码功能

##20160818 @linwl
>1. 优化定时任务。punish_update_unlock 每30分钟执行（优化逻辑后，再改为5分钟）；gift_rank每15分钟执行


##20160829 @jinrong
>1. 新增 配置项导航栏都是三级的模式。即：首页->列表->详细
2. 新增 配置项平台版本号改为使用三段时输入
3. 新增 配置项指定平台发布时，预览要显示完整配置

##20160815 @jinrong
>1. 新增 giftRank排行榜定时任务（每5分钟运行）


##20160809 @linwl
>1. 修改 user style(String) => style[String]

##20160808 @linwl
>1. 新增 config配置 api_sign_enable=false配置项

##20160808 @jinrong
>1. 修改 livelog报表过滤小于1分钟和大于6小时的脏数据
2. 修改 livelogs报表取消platform维度（已同步修改报表界面及接口）
3. BUGFIX 调整时区为雅加达时间

##20160805 @jinrong
>1. 优化 报表搜索功能
2. 新增 livelog报表过滤脏数据

##20160804 @jinrong
>1. 新增 报表下载功能(按搜索条件及维度)
2. BUGFIX 下载报表时会下载多个重复报表
3. 修改 从月报表的detail入口进入日报表，所有输入框都禁用

##20160802 @linwl
>1. 新增 主播列表增加封面图显示
2. 新增 主播编辑页增加NeedEditCover标识功能
3. 变更 将modules/*/*.html文件排除git管理

##20160801 @jinrong
>1. 优化 报表生成逻辑

##20160730 @jinrong
>1. 修复 报表数据错误BUG(时区问题)

##20160729 @jinrong
>1. account改名为coins
2. 搜索字段时，将相应纬度加上
3. 导航上加上传递的参数显示
4. host manager未完成时，不显示 
5. 月报表没有把搜索条件传递到日报表
6. 日、月报表中，不显示分页下拉菜单和总记录数
7. 所有统计字段中‘sum’开头的都去掉'sum',如'sum count'改为'count'

##20160725 @linwl
>1. 变更 完善四个数据库连接；新增 四个数据库连接测试程序
2. 变更 适应多数据库连接，调整models目录结构

##20160725 @linwl
>1. 修改 finance/account type查询字段名称

##20160725 @jinrong
>1. 新增 报表系统实现从不同的数据库读写数据

#20160725 @zhenhui
>1. 敏感词页面导航条修改
2.敏感词页面导航条修改

#20160724 @zhenhui
>1. 敏感词接口改名字

##20160723 @jinrong
>1. BUGFIX 排行榜插入空数据
2. 新增 推送结果列表


#20160723 @zhenhui
>1. 添加排行榜页面
2.添加推送反馈页面

##20160723 @zhenhui
>1. 修改敏感词查看页面sensitive_word.js页面
2. 修改敏感词输入页面sensitive_detail.js页面
3. 在敏感词查看页面添加敏感词删除功能

##20160722 @jinrong
>1. 新增 定时任务:排行榜生成

##20160721 @jinrong
>1. 新增 appversion_detail页新增force_version字段

##20160713 @jinrong
>1. BUGFIX 修改HostDetail的admin_remark字段为空时修改不成功（需同步更新APIServer）

##20160712 @jinrong
>1. 修改 main-controller中403错误和401错误分开处理
2. 新增 基本完善权限系统
3. 修改 日期搜索历史 添加记录 结束日期（原来只记录搜索的开始日期）
4. 新增 数据库升级脚本

##20160711 @jinrong
>1. 新增 admin_detail页可编辑role字段

##20160708 @jinrong
>1. 修改 添加礼物不显示礼物id

2. 新增 输入礼物名验证（只能输入英文）

##20160707 @jinrong
>1. BUGFIX 修复日期插件日期显示不正确
2. 修改 礼物列表显示的字段

##20160704 @jinrong
>1. 修改 所有的日期搜索改为日期插件

## 20160701 @linwl
>1. 新增 界面权限模块控制（无权限隐藏）
2. 初步完成权限系统前端->后端的整体控制

## 20160630 @linwl
>1. 新增 /liveLogs/list,feedback/feedback_list页增加device综合字段列显示
2. 新增 初步完成权限服务器端过滤机制
3. 新增 /permission/module列表页
4. 修改 permission_module model的parent＝>parentname
5. 新增 /permission/role列表页
6. 新增 SUPER_ADMIN支持逻辑，实现通过指定role拥有SUPER_ADMIN权限限，使用系统所有功能

## 20160628 @linwl
>1. 新增 permission_modules、permission_modules_privilege、permission_role models
2. 新增 admin model 增加 role(String)字段
3. 新增 mod/fs 权限扫描逻辑

## 20160627 @linwl
>1. 新增 banner/top、banner/top_detail页增加content_type字段
2. 修改 liveLogs/list页调用liveLogs/find接口时，传递__lt＝total参数，用于区分是否需要聚合查询，优化性能  

##20160627 @jinrong
>1. 新增 Recommend 图片限制大小，不限制尺寸
2. 修改 Recommend detail 页的tips样式
3. 新增 服务器时区提示

##20160624 @jinrong
>1. 新增 appversion页及功能


## 20160622 @jinrong
>1. 新增 kendo-grid控件增加支持pageSize选择框配置 
2. 新增 每场直播礼物流水

## 20160620 @jinrong
>1. 新增 SMSLogs页
2. 新增 Recommend 图片增加图片尺寸提示，根据不同平台
3. 新增 live logs页日期搜索使用日期插件

## 20160620 @linwl
>1. 修改 host detail的表单项隐藏/显示
2. 优化 detail页状态文本显示 
3. 新增 report增加PC直播间链接地址

## 20160617 @jinrong
>1. 新增 gift list页和gift detail页

## 20160619 @linwl
>1. BUGFIX recommend platform写入错误问题
2. 删除 Host intro required限制
3. BUGFIX anchor_group无法取消问题

## 20160617 @linwl
>1. Feature FIX 推荐平台由单选修改为多选. 修改此需求的相关代码

## 20160616 @linwl
>1. 修改 主菜单图标
2. 修改 所有显示的Anchor文本改为Host

## 20160614 @linwl
>1. 优化 anchor list和gift list的状态、id显示为文本
2. 优化 moment改为依赖bower
3. 新增 anchor_punish 限制主播显示功能页
4. 新增 user admin_remark字段管理
5. 变更 删除/user/cmsUpdate接口依赖
6. 新增 official字段、anchor_status字段搜索
7. 优化 anchor_list列表字段显示项目
8. 新增 official字段管理

## 20160530 @liangjunrui
>1. 新增anchor_recommend以及top_recommend界面

## 20160520 @Owen.Lin
>1. 新增 pay items功能页面

## 20160519 @Owen.Lin
>1. 新增 操作日志列表功能及相关逻辑代码
2. 完善 Makefile、package.json、bower.json
3. BUGFIX logout无效
4. 新增 修改、显示管理员组功能 
5. 修改 grid组件改为英文语言包

## 20160518 @Owen.Lin
>1. 新增 界面权限控制逻辑
2. 新增 登录逻辑
3. 新增 api访问登录判断
4. 新增 管理员的增、删、改、查功能
5. 优化 service的del方法封装

## 20160517 @Owen.Lin
>1. 升级NodeJS server相关package
2. 升级grid控件
3. 优化 目录结构 
4. 新增 透传API逻辑
5. 新增 用户管理和初步完成主播列表、详细页管理
6. 新增 api-client新增支持post
7. 新增 礼物流水列表

### #20160112 @Owen.Lin
>新增 grid、service操作时的api签名，测试get、save、del、search均通过

### #20151124 @Owen.Lin
>1. 增加 topic/reply相关页面功能，具体功能和调用，待完善
2. 增加 user/相关页面功能，具体功能和调用，待完善
3. 优化 gruntfile.js。监控后台所有的shtml和html文件，自动重新生成html；增加cleanSSICache方法；
4. 完善 topic/list的各操作入口

### #20151123 @Owen.Lin
>1. 修复 framework-kendoui/directive-grid.js使用jquery live方法，导致dbclick方法失效问题
2. 完成 项目管理的列表和详细页基本功能DEMO

### #20151120 @Owen.Lin
>1. 初始化项目
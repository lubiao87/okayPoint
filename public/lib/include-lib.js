/* 2017-12-7 11:57:13 | 修改 木遥（微信:  http://marsgis.cn/weixin.html ） */
//第三方类库加载管理js，方便切换lib
(function () {
    var r = new RegExp("(^|(.*?\\/))(include-lib\.js)(\\?|$)"),
        s = document.getElementsByTagName('script'), targetScript;
    for (var i = 0; i < s.length; i++) {
        var src = s[i].getAttribute('src');
        if (src) {
            var m = src.match(r);
            if (m) {
                targetScript = s[i];
                break;
            }
        }
    }

    //当前版本号,用于清理浏览器缓存
    // var cacheVersion = "20200102";

    // cssExpr 用于判断资源是否是css
    var cssExpr = new RegExp('\\.css');

    function inputLibs(list) {
        if (list == null || list.length == 0) return;

        for (var i = 0, len = list.length; i < len; i++) {
            var url = list[i];
            if (cssExpr.test(url)) {
                var css = '<link rel="stylesheet" href="' + url + '">';
                document.writeln(css);
            } else {
                var script = '<script type="text/javascript" src="' + url + '"><' + '/script>';
                document.writeln(script);
            }
        }
    }

    //加载类库资源文件
    function load() {
        var arrInclude = (targetScript.getAttribute('include') || "").split(",");
        var libpath = (targetScript.getAttribute('libpath') || "");


        //为了节省github空间，没有上传lib下面的类库到github
        //如果离线使用，可以从付费交付后的基础项目的lib目录内拷贝覆盖，并注释下面一行代码
        // libpath = "http://cesium.marsgis.cn/lib/"


        if (libpath.lastIndexOf('/') != libpath.length - 1)
            libpath += "/";

        var libsConfig = {
            // 'jquery': [
            //     libpath + "jquery/jquery-2.1.4.min.js",
            // ],
            'three': [
                libpath + "threejs/three.min.js",
                libpath + "threejs/controls/OrbitControls.js",
            ],
            'OkayPoints': [
                libpath + "okaypoints/okaypoints.min.js",
            ],
            'nipplejs': [
                libpath + "nipplejs/nipplejs.js",
            ],
        };




        for (var i in arrInclude) {
            var key = arrInclude[i];
            inputLibs(libsConfig[key]);
        }

    }

    load();
})();

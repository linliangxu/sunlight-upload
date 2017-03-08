Sunlight Upload
===============================
异步上传Jquery插件
----------------------------
```
功能配置：
autoUpload: false,			//选择文件后自动上传
submitBtn: '#xuSubmit',			//提交上传按钮
clearBtn: '#xuClear',				//清除上传列表
display: false,						//是否显示进度（设置false后可以自定义上传进度，使用uploading参数）
showArea: null,						//显示进度的容器
extension: 'jpg|jpeg|gif|png|zip',				//限制后缀
selectFileLabel: 'Select File',					//文件选择器文字
timeInterval: [1, 2, 4, 2, 1, 5], 					
percentageInterval: [10, 20, 30, 40, 60, 80],
extensionPrompt: null,							//格式错误提示语
limit: 1,												//单次最大上传数
upload: '上传',										
cancel: '取消',
dele: '删除',
anew: '重新上传',
cancelAll: 'Cancel',
prepare: '等待上传',
success: '上传成功',
fail: '上传失败',
canceled: '已取消',
uploadChange: function () {},						//选择文件后回调
uploading: function () {},								//上传中回调
afterEachUpload: function () {} 					//上传完回调
```

```
例子
<!doctype html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<title>jQuery Sunlight Upload Plugin</title>
	<link rel="stylesheet" href="../css/reset.css" type="text/css">
	<link rel="stylesheet" href="../css/sunlight-upload.css" type="text/css">
	<script type="text/javascript" src="../jquery.min.js"></script>
	<script type="text/javascript" src="../sunlight-upload.js"></script>
	<style type="text/css">
	body {padding:0;margin: 0;}
	h1 {font-size: 50px;	margin-bottom:40px; background: #000; color: #fff; padding: 30px;}
	.xuUploadBox {margin:0 50px;}
	</style>
</head>
<body>
	<h1>jQuery Sunlight Upload Plugin</h1>
	<div class="xuUploadBox">
		<div class="xuTitle">
			<form action="handle.php" method="post" enctype="multipart/form-data">
				<input type="file" name="file" id="xuUpload" multiple>
				<!-- <input type="submit" value="提交"> -->
			</form>
		</div>
		<div id="xuShowArea"></div>
		<div class="xuBottom">
			<div class="xuButton">
				<span id="xuSubmit" type="submit">Upload</span>
				<!-- <input type="submit" value="提交" id="xuSubmit"> -->
				<span id="xuClear" type="reset">Clear</span>
			</div>
		</div>
	</div>
	<script>
		jQuery(function ($) {
			$('#xuUpload').sunlightUpload({limit: false, display: true, showArea: '#xuShowArea'});
		});
	</script>
</body>
</html>
```
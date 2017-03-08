<?php
if (isset($_FILES)) {
	include 'SunlightUpload.php';
	$upload = new SunlightUpload(array('exts' => array('jpg', 'png', 'gif', 'zip'), 'maxSize' => 102400));
	$reslut = $upload->upload('file');
	if (!$reslut) {
		$reslut = $upload->error;
	}
	echo json_encode($reslut);
}

?>
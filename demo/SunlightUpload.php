<?php
/**
 * SunlightUpload Class.
 * @version 1.0.0
 * @package Plug
 * @author Linxu
 * @link http://article.zhile.name
 * @email lliangxu@qq.com
 * @date 2014-01-05
 */
class SunlightUpload {

	private $config = array(
		'maxSize' => 10240,
		'exts' => array('jpg', 'gif', 'png'),
		'name' => '',
		'savePath' => '.',
		'subDir' => ''
	);

	private $info;
	private $error;

	public function __construct ($config = array()) {
		$this->config['subDir'] = date('y/m/d');
		$this->config($config);
	}

	public function config ($config) {
		if (is_array($config)) {
			$this->config = array_merge($this->config, $config);
		}
	}

	public function __get ($name) {
		if (isset($this->$name)) {
			return $this->$name;
		} else {
			return null;
		}
	}

	public function __set ($name, $value) {
		if (isset($this->config[$name])) {
			$this->config[$name] = $value;
			return true;
		} else {
			return false;
		}
	}

	public function upload ($name = 'file') {
		if (!isset($_FILES[$name])) {
			$this->error = array('status' => 9, 'message' => '没有选择上传的文件');
			$this->info = array();
			return false;
		} else {
			$this->error = array();
			$file = $_FILES[$name];
		}

		$config = $this->config;

		$savePath = $config['savePath'];
		if (!empty($config['subDir'])) {
			$savePath .= '/' . $config['subDir'];
		}
		if (is_dir($savePath)) {
			if (!is_writable($savePath)) {
				$this->error = array('status' => 10, 'message' => '上传目录'.$savePath.'不可写');
				return false;
			}
		} else {
			if (!mkdir($savePath, 0777, true)) {
				$this->error = array('status' => 11, 'message' => '创建上传目录'.$savePath.'失败');
				return false;
			}
		}

		if (is_array($file['name'])) {
			$count = count($file['name']);
			for ($i = 0; $i < $count; $i ++) {
				$files[$i]['name'] = $file['name'][$i];
				$files[$i]['type'] = $file['type'][$i];
				$files[$i]['tmp_name'] = $file['tmp_name'][$i];
				$files[$i]['error'] = $file['error'][$i];
				$files[$i]['size'] = $file['size'][$i];
			}

			foreach ($files as $key => $file) {
				if ($this->check($file)){
					if ($this->save($file)) {
						$info[$key] = $this->info;
					} else {
						$info[$key] = $this->error;
					}
				} else {
					$info[$key] = $this->error;
				}
			}

			return $info;
		} else {
			if (!$this->check($file))
				return false;

			if (!$this->save($file))
				return false;
		}
		return $this->info;
	}

	private function checkError ($status) {
		
		switch ($status) {
			case 0:
				$error['status'] = 0;
				break;
			case 1:
				$error = array('status' => 1, 'message' => '上传的文件超过了 php.ini 中 upload_max_filesize 选项限制的值');
				break;
			case 2:
				$error = array('status' => 2, 'message' => '上传文件的大小超过了 HTML 表单中 MAX_FILE_SIZE 选项指定的值');
				break;
			case 3:
				$error = array('status' => 3, 'message' => '文件只有部分被上传');
				break;
			case 4:
				$error = array('status' => 4, 'message' => '没有文件被上传');
				break;
			case 6:
				$error = array('status' => 6, 'message' => '找不到临时文件夹');
				break;
			case 7:
				$error = array('status' => 7, 'message' => '文件写入失败');
				break;
			default:
				$error = array('status' => 8, 'message' => '未知上传错误');
				break;
		}

		if ($error['status'] == 0) {
			return true;
		} else {
			$this->error = $error;
			return false;
		}
	}

	private function check ($file) {
		if (!$this->checkError($file['error']))
			return false;

		if (!is_uploaded_file($file['tmp_name'])) {
			$this->error = array('status' => 12, 'message' => '非法上传文件');
			return false;
		}

		if (!$this->checkSize($file['size']))
			return false;

		if (!$this->checkExt($file))
			return false;
		

		return true;
	}

	private function checkSize ($size) {
		$size = $size / 1024;
		$maxSize = $this->config['maxSize'];
		if (0 == $maxSize || $size <= $maxSize) {
			return true;
		} else {
			$this->error = array('status' => 13, 'message' => '上传文件大小不符');
			return false;
		}
	}

	private function checkExt ($file) {
		$info = getimagesize($file['tmp_name']);
		if ($info) {
			switch ($info[2]) {
				case 1:
					$ext = 'gif';
					break;
				case 2:
					$ext = 'jpg';
					break;
				case 3:
					$ext = 'png';
					break;
				case 5:
					$ext = 'psd';
					break;
				case 6:
					$ext = 'bmp';
					break;
				case 7:
					$ext = 'tif';
					break;
				case 10:
					$ext = 'jpf';
					break;
				case 14:
					$ext = 'iff';
					break;
				case 15:
					$ext = 'wbm';
					break;
				default:
					$ext = pathinfo($file['name'], PATHINFO_EXTENSION);
					break;
			}

			if ($ext == 'gif' && empty($imginfo['bits'])) {
				$this->error = array('status' => 14, 'message' => '非法图像文件');
			}
		} else {
			$ext = pathinfo($file['name'], PATHINFO_EXTENSION);
		}

		if (is_string($this->config['exts']))
			$this->config['exts'] = explode(',', $this->config['exts']);

		$ext = strtolower($ext);
		if (in_array($ext, $this->config['exts'])) {
			$this->info['type'] = $ext;
			return true;
		} else {
			$this->error = array('status' => 15, 'message' => '上传文件' . $ext . '后缀不允许');
			return false;
		}
	}

	private function save ($file) {
		$filename = $this->config['savePath'];
		if (empty($this->config['name'])) {
			//$name = microtime(true) * 10000 . mt_rand();
			$name = substr(time(), 5) . mt_rand(0, 9999);
		} else {
			$name = $this->config['name'];
		}
		$name .= '.' . $this->info['type'];
		if (empty($this->config['subDir'])) {
			$savename = $name;
		} else {
			$savename = $this->config['subDir'] . '/' . $name;
		}


		$filename .= '/' . $savename;

		$this->info['filename'] = $file['name'];
		$this->info['name'] = $name;
		$this->info['save'] = $savename;
		$this->info['file'] = $filename;
		$this->info['size'] = $file['size'];


		if (!move_uploaded_file($file['tmp_name'], $filename)) {
			$this->error = array('status' => 16, 'message' => '文件上传保存错误');
			return false;
		}

		$this->info['status'] = 0;

		return true;
	}
}

?>
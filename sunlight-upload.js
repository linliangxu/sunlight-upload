/**
 * Sunlight Upload Class.
 * @version 1.0.0
 * @package Plug
 * @author Linxu
 * @link http://article.zhile.name
 * @email lliangxu@qq.com
 * @date 2014-01-01
 */
(function ($) {
	$.fn.sunlightUpload = function(config) {
		config = $.extend({}, {
			autoUpload: false,
			submitBtn: '#xuSubmit',
			clearBtn: '#xuClear',
			display: false,
			showArea: null,
			extension: 'jpg|jpeg|gif|png|zip',
			selectFileLabel: 'Select File',
			timeInterval: [1, 2, 4, 2, 1, 5], 
			percentageInterval: [10, 20, 30, 40, 60, 80],
			extensionPrompt: null,
			limit: 1,
			upload: '上传',
			cancel: '取消',
			dele: '删除',
			anew: '重新上传',
			cancelAll: 'Cancel',
			prepare: '等待上传',
			success: '上传成功',
			fail: '上传失败',
			canceled: '已取消',
			uploadChange: function () {},
			uploading: function () {},
			afterEachUpload: function () {}
		}, config);

		if (window.FormData) {
			var isHtml5 = true;
		} else {
			var isHtml5 = false;
		}

		var	selector = $(this).selector,
			totalForm = 0,
			limit = config.limit ? true : false,
			showArea = config.showArea ? config.showArea : '#xuShowArea',
			fileIndex = 1,
			stopUpload = true,
			uploadAll = null,
			jQxhr = null;

		var xu = {
			init: function () {
				uploadAll = $(config.submitBtn).text();
				if (!uploadAll) {
					uploadAll = $(config.submitBtn).val();
				}
				toggleCancel(false);
				$(selector).wrap('<span class="xuSelectFile" style="cursor: pointer;">' + config.selectFileLabel +'</span>');
				xu.form = $(selector).parents('form').hide();
				xu.form.after('<span id="xuFormArea"></span>');
				if (isHtml5) {
					$(selector).hide();
				}
				var style = '<style type="text/css">\
							.xuSelectFile {overflow: hidden; position: relative;display: inline-block;}\
							.xuHandle li {cursor: pointer;}' +
							selector + ' {cursor: pointer;position: absolute;right: 0;bottom: 0;font-size:100px;-ms-filter:"progid:DXImageTransform.Microsoft.Alpha(Opacity=0)"; filter:alpha(opacity=0); opacity: 0;}\
					</style>';
				$('head').append(style);
				xu.printForm();

				if (config.display && !config.showArea) {
					$('#xuFormArea').after('<div id="xuShowArea"></div>');
				}
			},
			printForm: function () {
				var formId = 'xuForm_' + fileIndex;
				var iframeId = formId + '_Frame';
				var $form = xu.form.clone();
				$form.attr({id: formId, target: iframeId, style: 'display: inline-block;'});
				$('#xuFormArea').append($form);
				
				if (!isHtml5) {
					$('<iframe name="' + iframeId + '"></iframe>').attr({id: iframeId, style: 'display:none', src: 'about:blank'}).appendTo('#xuFormArea');
				}

				$('#xuForm_' + fileIndex).find(selector).change(function () {
					if (isHtml5) {
						html5Change(this);
					} else {
						uploadChange($(this));
					}
				});
			},
			filenameGet: function (file) {
				if (file.indexOf('/') > -1){
					file = file.substring(file.lastIndexOf('/') + 1);
				} else if (file.indexOf('\\') > -1){
					file = file.substring(file.lastIndexOf('\\') + 1);
				}
				
				return file;
			},
			checkFile: function (filename) {
				var extensions = new RegExp(config.extension + '$', 'i');
				if (extensions.test(filename)){
					return filename;
				} else {
					return -1;
				}
			},
			fileSizeGet: function (file) {
				var fileSize = 0;
				var fileSize = 0;
				if (file.size > 1024 * 1024) {
					fileSize = (Math.round(file.size * 100 / (1024 * 1024)) / 100).toString() + 'MB';
				} else {
					fileSize = (Math.round(file.size * 100 / 1024) / 100).toString() + 'KB';
				}
				return fileSize;
			}
		}

		xu.init();

		function html5Change ($this) {
			$.each($this.files, function(index, file) {
				uploadChange(file);
			});

			$('.xuFinishItem').remove();
			afterUploadChange();
		}

		$.event.props.push('dataTransfer');
		$(showArea).bind('dragenter dragover', false).bind('drop', function (e) {
			e.stopPropagation();
			e.preventDefault();
			html5Change(e.dataTransfer);
		});

		function uploadChange ($this) {
			
			var filename = isHtml5 ? $this.name : xu.filenameGet($this.val());
			
			if (xu.checkFile(filename) == -1) {
				if ($.isFunction(config.extensionPrompt)) {
					config.extensionPrompt($this);
				} else {
					alert('请选择格式为：' + config.extension + '文件');
				}
				return false;
			}

			$form = $('#xuForm_' + fileIndex);
			$form.addClass('xuUploadForm');
			if (isHtml5) {
				$form.data('input', $this);
			}
			$form.hide();

			if (config.display) {
				if (isHtml5) {
					filename += '（' + xu.fileSizeGet($this)+ '）';
				}
				var html = '<div class="xuFileItem" id="xuForm_' + fileIndex + '_Item" item="' + fileIndex + '">\
								<span class="xuName">' + filename + '</span>\
								<ul class="xuHandle">\
									<li class="xuUpload">' + config.upload + '</li>\
									<li class="xuDelete">' + config.dele + '</li>\
								</ul>\
								<div class="xuProgress" style="display:none;">\
									<div class="xuProgressBar"><div style="width:0%;"></div></div>\
									<div class="xuPercentage">0%</div>\
								</div>\
								<div class="xuMessage">' + config.prepare + '</div>\
							</div>';
				$(showArea).append(html);
			}

			fileIndex++;

			xu.printForm();

			config.uploadChange(filename, fileIndex - 1);

			if (limit) {
				$xuUploadForm = $('#xuFormArea form.xuUploadForm');
				if ($xuUploadForm.length > config.limit) {
					$overstepForm = $($xuUploadForm.get(0));
					var overstepFormId = '#' + $overstepForm.attr('id');
					$overstepForm.remove();
					if (!isHtml5) {
						$(overstepFormId + '_Frame').remove()
					}
					if (config.display) {
						$(overstepFormId + '_Item').remove();
					}
				}
			}
			if (!isHtml5) {
				$('.xuFinishItem').remove();
				afterUploadChange();
			}
		}

		function afterUploadChange () {
			if (config.autoUpload) {
				if ($('.xuUploadingForm').length == 0) {
					stopUpload = false;
					uploadQueue();
				}
			}
		}

		function uploadQueue () {

			if (stopUpload) {
				return;
			}

			$xuUploadForm = $('#xuFormArea form.xuUploadForm');
			totalForm = $xuUploadForm.get().length;
			if (totalForm > 0) {
				toggleCancel(true);
				$form = $($xuUploadForm.get(0));

				beforeEachUpload($form);

				if (isHtml5) {
					html5Upload($form);
				} else {
					iframeUpload($form);
				}
			} else {
				stopUpload = true;
				toggleCancel(false);
			}
			
		}

		function html5Upload ($form) {
			file = $form.data('input');
			if (file) {
				var fd = new FormData();
				fd.append($form.find(selector).attr('name'), file);
				
				$form.find(':input').each(function() {
					if (this.type != 'file') {
						fd.append($(this).attr('name'), $(this).val());
					}
				});

				var formId = '#' + $form.attr('id');
				if (config.display) {
					$item = $(formId + '_Item');
					$xuProgressBar = $item.find('.xuProgressBar div');
					$xuPercentage = $item.find('.xuPercentage');
				}

				jQxhr = $.ajax({
					url: $form.attr('action'),
					data: fd,
					cache: false,
					contentType: false,
					processData: false,
					type: 'POST',
					xhr: function () {
						var req = $.ajaxSettings.xhr();
						if (req) {
							req.upload.addEventListener('progress', function (event) {
								progress = Math.round(event.loaded * 100 / event.total);
								if (config.display) {
									$xuPercentage.text(progress.toString() + '%');
									$xuProgressBar.width(progress.toString() + '%');
								}
								config.uploading(progress, formId);
							}, false);
						}
						return req;
					}
				})
				.success(function (data) {
					afterEachUpload(formId, data);
				})
				.error(function (jQxhr, status, error) {
					afterEachUpload(formId, null, status, error);
				})
				.complete(function (jQxhr, status) {
					if (config.display) {
						$xuPercentage.text('100%');
						$xuProgressBar.width('100%');
					}
					uploadQueue();
				});
			}
		}

		function iframeUpload ($form) {
			var formId = '#' + $form.attr('id');
			$xuProgressBar = null;
			$xuPercentage = null;
			if (config.display) {
				$item = $(formId + '_Item');
				$xuProgressBar = $item.find('.xuProgressBar div');
				$xuPercentage = $item.find('.xuPercentage');
			}	
			progressCount = 0;
			dummyProgress($xuProgressBar, $xuPercentage, formId);

			$form.submit();
			
			$(formId + '_Frame').load(function () {
				data = $(this).contents().find('body').html();
				clearTimeout(progressTime);
				progress = 100;
				config.uploading(progress, formId);
				if (config.display) {
					progress = progress.toString();
					$xuPercentage.text(progress + '%');
					$xuProgressBar.width(progress + '%');
				}
				var status = data ? 'success' : 'abort';
				afterEachUpload(formId, data, status);
				uploadQueue();
			});

			
		}

		function dummyProgress ($progressBar, $percentage, formId) {
			if (config.percentageInterval[progressCount]) {
				progress = config.percentageInterval[progressCount] + Math.floor(Math.random() * 5 + 1);
				if (config.display) {
					$percentage.text(progress.toString() + '%');
					$progressBar.width(progress.toString() + '%');
				}
				config.uploading(progress, formId);
			}

			if (config.timeInterval[progressCount]) {
				progressTime = setTimeout(function () {
					dummyProgress($progressBar, $percentage);
				}, config.timeInterval[progressCount] * 1000);
			}

			progressCount ++;
		}

		function beforeEachUpload ($form) {
			var formId = '#' + $form.attr('id');
			$form.removeClass('xuUploadForm').addClass('xuUploadingForm');
			
			if (config.display) {
				$item = $(formId + '_Item');
				$item.find('.xuProgressBar div').width(0);
				$item.find('.xuPercentage').text('0%');
				$item.find('.xuProgress').show();
				$item.find('.xuMessage').hide();
				$item.find('.xuUpload').removeClass('xuUpload').addClass('xuCancel').text(config.cancel);
			}
		}

		function afterEachUpload (formId, data, status, message) {

			if (data) {
				data = eval('(' + data + ')');
				status = data.code ? 'error' : 'success';
				message = data.message ? data.message : config.success;

				$(formId + '.xuUploadingForm').remove();
				if (!isHtml5) {
					$(formId + '_Frame').remove();
				}
			} else if (status == 'abort') {
				status = 'cancel';
				message = config.canceled;
				$(formId).removeClass('xuUploadingForm').addClass('xuUnfinishedForm');
			} else {
				message = message ? message : config.fail;
				$(formId).removeClass('xuUploadingForm').addClass('xuUnfinishedForm');
			}
			
			if (config.display) {
				$item = $(formId + '_Item');
				$item.find('.xuProgress').hide();
				$xuMessage = $item.find('.xuMessage');

				if (status == 'success') {
					$item.addClass('xuFinishItem').find('.xuCancel').hide();
				} else if (status == 'cancel') {
					$item.find('.xuCancel').removeClass('xuCancel').addClass('xuUpload').text(config.anew);
				} else {
					$item.find('.xuCancel').removeClass('xuCancel').addClass('xuUpload').text(config.anew);
				}

				$xuMessage.addClass(status).text(message).show();

			}

			config.afterEachUpload(data, status, formId, message);
		}

		function toggleCancel (cancel) {

			if (cancel) {
				$(config.submitBtn).removeClass('xuUploadAll').addClass('xuCancelAll').attr({'title': config.cancelAll}).text(config.cancelAll).val(config.cancelAll);
			} else {
				$(config.submitBtn).removeClass('xuCancelAll').addClass('xuUploadAll').attr({'title': uploadAll}).text(uploadAll).val(uploadAll);
			}
		}

		$('.xuUploadAll').live('click', function () {
			$('.xuUnfinishedForm').removeClass('xuUnfinishedForm').addClass('xuUploadForm');
			stopUpload = false;
			
			if ($('.xuUploadingForm').length == 0) {
				uploadQueue();
			}
			return false;
		});

		$('.xuSelectFile').live('click', function () {
			$(this).find(selector).click(function(event) {
				event.stopPropagation();
			}).click();
		});

		$('.xuFileItem .xuUpload').live('click', function () {
			var index = $(this).parents('.xuFileItem').attr('item');
			$form = $('#xuForm_' + index);
			if ($('.xuUploadingForm').length == 0) {
				if ($form.length > 0) {
					stopUpload = false;
					beforeEachUpload($form);
					if (isHtml5) {
						html5Upload($form);
					} else {
						iframeUpload($form);
					}
					stopUpload = true;
				}
			} else {
				$form.removeClass('xuUnfinishedForm').addClass('xuUploadForm');
			}
		});

		$('.xuFileItem .xuCancel').live('click', function () {
			if (jQxhr) {
				jQxhr.abort();
			} else {
				var item = $(this).parents('.xuFileItem').attr('item');
				var formId = '#xuForm_' + item;
				$(formId + '_Frame').attr('src', 'about:blank');
			}
		});

		$('.xuCancelAll').live('click', function () {
			stopUpload = true;
			if (jQxhr) {
				jQxhr.abort();
			} else {
				var formId = '#' + $('.xuUploadingForm').attr('id');
				$(formId + '_Frame').attr('src', 'about:blank');
			}
			toggleCancel(false);
		});

		$('.xuFileItem .xuDelete').live('click', function () {
			$xuFileItem = $(this).parents('.xuFileItem');
			var item = $xuFileItem.attr('item');
			$('#xuForm_' + item).remove();
			if (!isHtml5) {
				$('#xuForm_' + item + '_Frame').remove();
			}
			$xuFileItem.fadeOut(function () {
				$xuFileItem.remove();
			});

		});

		$(config.clearBtn).live('click', function () {
			$('#xuFormArea .xuUploadForm').remove();
			if (!isHtml5) {
				$('#xuFormArea form.xuUploadForm').remove();
			}
			$(showArea + ' .xuFileItem').fadeOut(function () {
				$(this).remove();
			});
		});

	}
})(jQuery);
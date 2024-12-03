document.addEventListener('DOMContentLoaded', function() {
    // 获取所有需要的DOM元素
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const originalPreview = document.getElementById('originalPreview');
    const compressedPreview = document.getElementById('compressedPreview');
    const originalSize = document.getElementById('originalSize');
    const compressedSize = document.getElementById('compressedSize');
    const qualitySlider = document.getElementById('quality');
    const qualityValue = document.getElementById('qualityValue');
    const downloadBtn = document.getElementById('downloadBtn');

    let originalFile = null;
    let compressedFile = null;

    // 上传区域点击事件
    uploadArea.addEventListener('click', () => fileInput.click());

    // 文件拖拽事件
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#007AFF';
    });

    uploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#DEDEDE';
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#DEDEDE';
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            handleImageUpload(file);
        } else {
            alert('请上传图片文件（PNG 或 JPG 格式）');
        }
    });

    // 文件选择事件
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleImageUpload(file);
        }
    });

    // 质量滑块事件
    qualitySlider.addEventListener('input', (e) => {
        qualityValue.textContent = `${e.target.value}%`;
        if (originalFile) {
            compressImage(originalFile, e.target.value / 100);
        }
    });

    // 下载按钮事件
    downloadBtn.addEventListener('click', () => {
        if (compressedFile) {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(compressedFile);
            link.download = `compressed_${originalFile.name}`;
            link.click();
        }
    });

    // 处理图片上传
    async function handleImageUpload(file) {
        try {
            // 检查文件类型
            if (!file.type.match('image.*')) {
                alert('请上传图片文件');
                return;
            }

            originalFile = file;
            originalSize.textContent = formatFileSize(file.size);
            
            // 显示原图预览
            const reader = new FileReader();
            reader.onload = function(e) {
                originalPreview.src = e.target.result;
            };
            reader.readAsDataURL(file);

            // 进行图片压缩
            await compressImage(file, qualitySlider.value / 100);
        } catch (error) {
            console.error('处理图片时出错:', error);
            alert('处理图片时出错，请重试');
        }
    }

    // 压缩图片
    async function compressImage(file, quality) {
        try {
            const options = {
                maxSizeMB: 1,
                maxWidthOrHeight: 1920,
                useWebWorker: true,
                quality: quality
            };

            // 开始压缩
            const compressedBlob = await imageCompression(file, options);
            
            // 创建新的File对象
            compressedFile = new File([compressedBlob], file.name, {
                type: file.type
            });
            
            // 更新预览和信息
            compressedPreview.src = URL.createObjectURL(compressedFile);
            compressedSize.textContent = formatFileSize(compressedFile.size);
            downloadBtn.disabled = false;

            // 输出压缩信息
            console.log('压缩完成:', {
                原始大小: formatFileSize(file.size),
                压缩后大小: formatFileSize(compressedFile.size),
                压缩比例: Math.round((1 - compressedFile.size / file.size) * 100) + '%'
            });
        } catch (error) {
            console.error('压缩失败:', error);
            alert('图片压缩失败，请重试');
        }
    }

    // 格式化文件大小
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
});

/*
 * @Author: liziwei01
 * @Date: 2023-10-04 16:20:01
 * @LastEditors: liziwei01
 * @LastEditTime: 2023-10-05 02:07:38
 * @Description: file content
 */

const API_ENDPOINT = "http://localhost:8090/api/download";
const PAGE_LENGTH = 5;

let currentPage = 0;

function fetchFiles(page, page_length) {
    return fetch(`${API_ENDPOINT}/page?page=${page}&page_length=${page_length}`)
        .then(response => response.json())
        .then(data => {
            if (data.errno === 0) {
                return data.data.list;
            }
            throw new Error(data.errmsg);
        });
}

function renderFiles(files) {
    const fileListDiv = document.querySelector('.file-list');
    fileListDiv.innerHTML = ''; // Clear existing files

    files.forEach(file => {
        const fileElem = document.createElement('div');
        const isImage = file.endsWith('.png') || 
               file.endsWith('.jpg') || 
               file.endsWith('.jpeg') || 
               file.endsWith('.gif') || 
               file.endsWith('.psd') || 
               file.endsWith('.webp') ||
               file.endsWith('.bmp') ||
               file.endsWith('.tiff') || 
               file.endsWith('.tif') ||
               file.endsWith('.svg') ||
               file.endsWith('.ico') ||
               file.endsWith('.heic') ||
               file.endsWith('.raw');

        const isVideo = file.endsWith('.mp4') || 
                file.endsWith('.webm') || 
                file.endsWith('.mkv') || 
                file.endsWith('.flv') || 
                file.endsWith('.vob') || 
                file.endsWith('.ogv') || 
                file.endsWith('.ogg') || 
                file.endsWith('.avi') || 
                file.endsWith('.mov') || 
                file.endsWith('.wmv') || 
                file.endsWith('.mts') || 
                file.endsWith('.m2ts') || 
                file.endsWith('.ts');

        if (isImage) {
            const img = document.createElement('img');
            img.src = `${API_ENDPOINT}/stream?path=${file}`;
            img.onclick = () => showPreview(img.src, 'image');
            fileElem.appendChild(img);
        } else if (isVideo) {
            const video = document.createElement('video');
            video.controls = true;
            const source = document.createElement('source');
            source.src = `${API_ENDPOINT}/stream?path=${file}`;
            source.type = 'video/mp4';
            video.appendChild(source);
            video.onclick = () => showPreview(source.src, 'video');
            fileElem.appendChild(video);
        } else {
            // Handle non-image, non-video files
            const fileElem = document.createElement('div');
            fileElem.classList.add('non-image-video');
            
            // Simple approach to decide which icon to use:
            const fileExtension = file.split('.').pop();
            let iconText;
            switch (fileExtension) {
                case 'pdf':
                    iconText = '📄';  // Use a paper icon for PDFs
                    break;
                case 'doc':
                case 'docx':
                    iconText = '📝';  // Use a writing icon for Word documents
                    break;
                // ... add more cases for different file types
                default:
                    iconText = '📁';  // Use a folder icon as a default
            }

            const iconElem = document.createElement('span');
            iconElem.classList.add('icon');
            iconElem.textContent = iconText;

            const fileNameElem = document.createElement('span');
            fileNameElem.textContent = file;

            fileElem.appendChild(iconElem);
            fileElem.appendChild(fileNameElem);
            fileElem.onclick = () => initiateDownload(file);  // Add download action

            fileListDiv.appendChild(fileElem);
        }

        fileListDiv.appendChild(fileElem);
    });
}

function showPreview(src, type) {
    const modalContent = document.getElementById('modalContent');
    modalContent.innerHTML = ''; // Clear previous preview

    if (type === 'image') {
        const img = document.createElement('img');
        img.src = src;
        modalContent.appendChild(img);
    } else if (type === 'video') {
        const video = document.createElement('video');
        video.controls = true;
        const source = document.createElement('source');
        source.src = src;
        source.type = 'video/mp4';
        video.appendChild(source);
        modalContent.appendChild(video);
    }

    document.getElementById('previewModal').style.display = 'block';
}

function initiateDownload(filename) {
    const a = document.createElement('a');
    a.href = `${API_ENDPOINT}/stream?path=${filename}`;
    // a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function closeModal() {
    document.getElementById('previewModal').style.display = 'none';
}

function nextPage() {
    currentPage++;
    fetchAndRender(currentPage);
}

function prevPage() {
    if (currentPage > 0) {
        currentPage--;
        fetchAndRender(currentPage);
    }
}

function fetchAndRender(page) {
    fetchFiles(page, PAGE_LENGTH).then(files => {
        renderFiles(files);
        document.querySelector('.current-page').textContent = page + 1; // Pages start from 1 for users
    }).catch(error => {
        console.error('Failed to fetch files:', error);
    });
}

function triggerUpload() {
    document.getElementById('fileInput').click();
}

function uploadFile(inputElem) {
    const file = inputElem.files[0];
    if (!file) {
        return;
    }

    const formData = new FormData();
    formData.append('file', file);

    fetch(`${API_ENDPOINT}/upload`, {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error('Unexpected response content type.');
        }

        return response.json();
    })
    .then(data => {
        if (data.errno === 0) {
            alert(data.data);
            fetchAndRender(currentPage);
        } else {
            alert('Failed to upload: ' + data.errmsg);
        }
    })
    .catch(error => {
        console.error('Failed to upload file:', error);
    });
}


// Initialize
fetchAndRender(currentPage);

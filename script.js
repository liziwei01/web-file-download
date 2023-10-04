/*
 * @Author: liziwei01
 * @Date: 2023-10-04 16:20:01
 * @LastEditors: liziwei01
 * @LastEditTime: 2023-10-04 16:42:38
 * @Description: file content
 */

const API_ENDPOINT = "http://127.0.0.1:8090/api/download";
const PAGE_LENGTH = 2;

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
        const isImage = file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg');
        const isVideo = file.endsWith('.mp4') || file.endsWith('.webm');

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

// Initialize
fetchAndRender(currentPage);

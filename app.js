async function loadMarkdown() {
    try {
        const response = await fetch('readme.md');
        const text = await response.text();
        parseMarkdown(text);
    } catch (error) {
        document.getElementById('content').innerHTML = '<div class="loading">خطا در بارگذاری فایل</div>';
    }
}

function parseMarkdown(markdown) {
    const lines = markdown.split('\n');
    const exercises = {};
    let currentExercise = null;
    let currentVideo = null;

    lines.forEach(line => {
        line = line.trim();
        
        if (line.startsWith('## ')) {
            currentExercise = line.replace('## ', '');
            exercises[currentExercise] = [];
        } else if (line.startsWith('### ')) {
            if (currentExercise) {
                if (currentVideo && currentVideo.link) {
                    exercises[currentExercise].push(currentVideo);
                }
                currentVideo = {
                    title: line.replace('### ', ''),
                    description: '',
                    link: ''
                };
            }
        } else if (line.startsWith('- **توضیحات:**') || line.startsWith('- توضیحات:')) {
            if (currentVideo) {
                currentVideo.description = line.replace(/- \*\*توضیحات:\*\*/, '').replace(/- توضیحات:/, '').trim();
            }
        } else if (line.includes('[بارگیری](') || line.includes('[دانلود](') || line.includes('[لینک](')) {
            if (currentVideo) {
                const linkMatch = line.match(/\[([^\]]+)\]\(([^)]+)\)/);
                if (linkMatch) {
                    currentVideo.link = linkMatch[2];
                    exercises[currentExercise].push(currentVideo);
                    currentVideo = null;
                }
            }
        }
    });
    
    if (currentExercise && currentVideo && currentVideo.link) {
        exercises[currentExercise].push(currentVideo);
    }

    renderExercises(exercises);
}

function renderExercises(exercises) {
    const content = document.getElementById('content');
    content.innerHTML = '';

    Object.keys(exercises).forEach((exerciseTitle, index) => {
        const videos = exercises[exerciseTitle];
        
        const section = document.createElement('div');
        section.className = 'exercise-section';
        
        const header = document.createElement('div');
        header.className = 'exercise-header';
        header.innerHTML = `
            <h2>${exerciseTitle}</h2>
            <span class="toggle-icon">▼</span>
        `;
        
        const videosContainer = document.createElement('div');
        videosContainer.className = 'videos-container';
        
        const videoGrid = document.createElement('div');
        videoGrid.className = 'video-grid';
        
        videos.forEach(video => {
            const card = document.createElement('div');
            card.className = 'video-card';
            card.innerHTML = `
                <h3><span class="video-icon"><svg fill="currentColor" width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20,24H4c-2.2,0-4-1.8-4-4V4c0-2.2,1.8-4,4-4h16c2.2,0,4,1.8,4,4v16C24,22.2,22.2,24,20,24z M4,2C2.9,2,2,2.9,2,4v16c0,1.1,0.9,2,2,2h16c1.1,0,2-0.9,2-2V4c0-1.1-0.9-2-2-2H4z"/><path d="M9,17c-0.2,0-0.3,0-0.5-0.1C8.2,16.7,8,16.4,8,16V8c0-0.4,0.2-0.7,0.5-0.9c0.3-0.2,0.7-0.2,1,0l7,4c0.3,0.2,0.5,0.5,0.5,0.9s-0.2,0.7-0.5,0.9l-7,4C9.3,17,9.2,17,9,17z M10,9.7v4.6l4-2.3L10,9.7z"/></svg></span>${video.title}</h3>
                ${video.description ? `<p>${video.description}</p>` : ''}
                <a href="${video.link}" class="download-btn" target="_blank" rel="noopener">
                    <span class="download-icon"><svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3,12.3v7a2,2,0,0,0,2,2H19a2,2,0,0,0,2-2v-7"/><polyline points="7.9 12.3 12 16.3 16.1 12.3"/><line x1="12" x2="12" y1="2.7" y2="14.2"/></svg></span>
                    بارگیری ویدیو
                </a>
            `;
            videoGrid.appendChild(card);
        });
        
        videosContainer.appendChild(videoGrid);
        
        header.addEventListener('click', () => {
            header.classList.toggle('active');
            videosContainer.classList.toggle('active');
        });
        
        section.appendChild(header);
        section.appendChild(videosContainer);
        content.appendChild(section);
    });
}

document.addEventListener('DOMContentLoaded', loadMarkdown);

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
                <h3><span class="video-icon">🎬</span>${video.title}</h3>
                ${video.description ? `<p>${video.description}</p>` : ''}
                <a href="${video.link}" class="download-btn" target="_blank" rel="noopener">
                    <span class="download-icon">⬇</span>
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

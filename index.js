const songs = [
    { file: 'assets/Aotl.mp4', name: 'All of the Lights ~ Kanye West', cover: 'assets/Aotl.jpg' },
    { file: 'assets/GoodLife.mp4', name: 'Good Life ~ Kanye West', cover: 'assets/GoodLife.jpg' },
    { file: 'assets/Homecoming.mp4', name: 'Homecoming ~ Kanye West', cover: 'assets/Homecoming.jpg' },
    { file: 'assets/FlashingLights.mp4', name: 'Flashing Lights ~ Kanye West', cover: 'assets/FlashingLights.jpg' },
    { file: 'assets/TouchTheSky.mp4', name: 'Touch the Sky ~ Kanye West', cover: 'assets/TouchTheSky.jpg' }
];

function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

let queue = shuffle(songs);
let history = [];
const video = document.getElementById('bg');
video.volume = 0.3;
video.addEventListener('ended', onEnded);

const preloaded = new Map();
const preloading = new Map();

function preload(song) {
    if (!song) return Promise.resolve();
    if (preloaded.has(song.file)) return Promise.resolve();
    if (preloading.has(song.file)) return preloading.get(song.file);
    const p = fetch(song.file)
        .then(r => r.blob())
        .then(blob => {
            preloaded.set(song.file, URL.createObjectURL(blob));
            preloading.delete(song.file);
        })
        .catch(() => { preloading.delete(song.file); });
    preloading.set(song.file, p);
    return p;
}

function srcFor(song) {
    return preloaded.get(song.file) || song.file;
}

let currentSong = null;
const firstSong = queue[0];
currentSong = firstSong;
video.src = firstSong.file;
video.load();
preload(firstSong).then(() => {
    // swap to blob if user hasn't started playing yet and it's still the same song
    if (currentSong === firstSong && video.paused && preloaded.has(firstSong.file)) {
        const blobUrl = preloaded.get(firstSong.file);
        const t = video.currentTime;
        video.src = blobUrl;
        video.currentTime = t;
        video.load();
    }
});
document.getElementById('title').textContent = firstSong.name;
document.getElementById('coverImg').src = firstSong.cover;

function playSong(song) {
    currentSong = song;
    const target = srcFor(song);
    const currentSrc = video.src;
    const alreadyLoaded = currentSrc === target || currentSrc.endsWith(song.file);
    if (!alreadyLoaded) {
        video.src = target;
    } else if (preloaded.has(song.file) && !currentSrc.startsWith('blob:')) {
        // upgrade to blob URL if available
        video.src = preloaded.get(song.file);
    }
    video.play();
    document.getElementById('title').textContent = song.name;
    document.getElementById('coverImg').src = song.cover;
    setPauseIcon(false);
    updatePrevState();
    if (queue[0]) preload(queue[0]);
}

function updatePrevState() {
    document.getElementById('prev').disabled = history.length < 2;
}

function onEnded() {
    playNext();
}

function playNext() {
    if (queue.length === 0) queue = shuffle(songs);
    const next = queue.shift();
    history.push(next);
    playSong(next);
}

function playPrev() {
    if (history.length < 2) return;
    history.pop();
    const prev = history.pop();
    queue.unshift(prev);
    playNext();
}

function setPauseIcon(paused) {
    document.getElementById('pauseIcon').style.display = paused ? 'none' : 'block';
    document.getElementById('playIcon').style.display = paused ? 'block' : 'none';
}

const messages = [
    'hi!! welcome to my bio i hope you like it!',
    'how u liking da music?',
    'do u like murder drones too?',
    'i wanna make love to N 🤫'
];

async function typeLoop() {
    const el = document.getElementById('typerText');
    let i = 0;
    while (true) {
        const msg = messages[i];
        for (let c = 0; c <= msg.length; c++) {
            el.textContent = msg.slice(0, c);
            await new Promise(r => setTimeout(r, 55));
        }
        await new Promise(r => setTimeout(r, 1800));
        for (let c = msg.length; c >= 0; c--) {
            el.textContent = msg.slice(0, c);
            await new Promise(r => setTimeout(r, 30));
        }
        await new Promise(r => setTimeout(r, 400));
        i = (i + 1) % messages.length;
    }
}

document.body.addEventListener('click', (e) => {
    if (e.target.closest('#stack')) return;
    document.getElementById('enter').style.display = 'none';
    document.body.classList.add('entered');
    document.body.style.cursor = 'default';
    document.getElementById('stack').classList.add('show');
    playNext();
    typeLoop();
    startTimer();
}, { once: true });

function startTimer() {
    const el = document.getElementById('timer');
    let seconds = 0;
    setInterval(() => {
        seconds++;
        const m = Math.floor(seconds / 60);
        const s = String(seconds % 60).padStart(2, '0');
        el.textContent = `${m}:${s}`;
    }, 1000);
}

document.getElementById('prev').addEventListener('click', playPrev);
document.getElementById('next').addEventListener('click', playNext);
document.getElementById('toggle').addEventListener('click', () => {
    if (!video.src) return;
    if (video.paused) {
        video.play();
        setPauseIcon(false);
    } else {
        video.pause();
        setPauseIcon(true);
    }
});

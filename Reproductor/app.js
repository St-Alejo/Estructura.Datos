"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class SongNode {
    constructor(song) {
        this.song = song;
        this.next = null;
        this.prev = null;
    }
}
class Playlist {
    constructor() {
        this.head = null;
        this.tail = null;
        this.current = null;
        this.size = 0;
    }
    playSong(id) {
        let currentNode = this.head;
        while (currentNode) {
            if (currentNode.song.id === id) {
                this.current = currentNode;
                return;
            }
            currentNode = currentNode.next;
        }
        throw new Error(`Canción con ID ${id} no encontrada`);
    }
    addToStart(song) {
        const newNode = new SongNode(song);
        if (!this.head) {
            this.head = newNode;
            this.tail = newNode;
            this.current = newNode;
        }
        else {
            newNode.next = this.head;
            this.head.prev = newNode;
            this.head = newNode;
        }
        this.size++;
    }
    addToEnd(song) {
        const newNode = new SongNode(song);
        if (!this.head) {
            this.head = newNode;
            this.tail = newNode;
            this.current = newNode;
        }
        else {
            newNode.prev = this.tail;
            if (this.tail) {
                this.tail.next = newNode;
            }
            this.tail = newNode;
        }
        this.size++;
    }
    addAfterCurrent(song) {
        if (!this.current) {
            this.addToEnd(song);
            return;
        }
        const newNode = new SongNode(song);
        newNode.prev = this.current;
        newNode.next = this.current.next;
        if (this.current.next) {
            this.current.next.prev = newNode;
        }
        else {
            this.tail = newNode;
        }
        this.current.next = newNode;
        this.size++;
    }
    moveCurrentToStart() {
        if (!this.current || this.size <= 1 || this.current === this.head) {
            return false;
        }
        const currentSong = this.current.song;
        this.removeSong(currentSong.id);
        this.addToStart(currentSong);
        this.playSong(currentSong.id);
        return true;
    }
    moveCurrentToEnd() {
        if (!this.current || this.size <= 1 || this.current === this.tail) {
            return false;
        }
        const currentSong = this.current.song;
        this.removeSong(currentSong.id);
        this.addToEnd(currentSong);
        this.playSong(currentSong.id);
        return true;
    }
    removeSong(id) {
        let current = this.head;
        while (current) {
            if (current.song.id === id) {
                if (this.size === 1) {
                    this.head = null;
                    this.tail = null;
                    this.current = null;
                }
                else if (current === this.head) {
                    this.head = current.next;
                    if (this.head)
                        this.head.prev = null;
                }
                else if (current === this.tail) {
                    this.tail = current.prev;
                    if (this.tail)
                        this.tail.next = null;
                }
                else {
                    if (current.prev)
                        current.prev.next = current.next;
                    if (current.next)
                        current.next.prev = current.prev;
                }
                if (current === this.current) {
                    this.current = current.next || current.prev || null;
                }
                this.size--;
                return;
            }
            current = current.next;
        }
    }
    getCurrentSong() {
        return this.current ? this.current.song : null;
    }
    nextSong() {
        if (!this.current)
            return null;
        this.current = this.current.next || this.head;
        return this.current ? this.current.song : null;
    }
    previousSong() {
        if (!this.current)
            return null;
        this.current = this.current.prev || this.tail;
        return this.current ? this.current.song : null;
    }
    getRandomSong() {
        const songs = this.getList();
        if (songs.length === 0)
            return null;
        const randomIndex = Math.floor(Math.random() * songs.length);
        return songs[randomIndex];
    }
    getList() {
        const list = [];
        let current = this.head;
        while (current) {
            list.push(current.song);
            current = current.next;
        }
        return list;
    }
    shuffle() {
        var _a;
        const songs = this.getList();
        for (let i = songs.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [songs[i], songs[j]] = [songs[j], songs[i]];
        }
        this.head = null;
        this.tail = null;
        const currentSongId = (_a = this.current) === null || _a === void 0 ? void 0 : _a.song.id;
        this.current = null;
        this.size = 0;
        songs.forEach(song => this.addToEnd(song));
        if (currentSongId) {
            try {
                this.playSong(currentSongId);
            }
            catch (error) {
                console.warn('La canción actual no se encontró después del shuffle');
            }
        }
    }
    getSize() {
        return this.size;
    }
}
class MusicPlayer {
    constructor() {
        this.isPlaying = false;
        this.isShuffle = false;
        this.isRepeat = false;
        this.currentVolume = 1;
        this.playlist = new Playlist();
        this.audio = new Audio();
        this.initialize();
    }
    initialize() {
        this.loadInitialSongs();
        this.setupEventListeners();
        this.renderPlaylist();
        this.setupVolumeControl();
        if (this.playlist.getSize() > 0) {
            this.playSong(this.playlist.getList()[0].id);
        }
    }
    loadInitialSongs() {
        const initialSongs = [
            {
                id: '1',
                title: 'Bandido',
                artist: 'Mike Towers',
                source: 'mp3/Bandido.mp3',
                cover: 'img/ai-generated-8101629_1280.png'
            },
            {
                id: '2',
                title: 'Castigo',
                artist: 'Feid',
                source: 'mp3/Castigo.mp3',
                cover: 'img/cities-8196605_1280.jpg'
            },
            {
                id: '3',
                title: 'Cosas pendientes',
                artist: 'Maluma',
                source: 'mp3/Cosas pendientes.mp3',
                cover: 'img/ai-generated-8296830_1280.jpg'
            }
        ];
        initialSongs.forEach(song => this.playlist.addToEnd(song));
    }
    setupEventListeners() {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        // Controles básicos
        (_a = document.getElementById('btn-play-pause')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', () => this.togglePlayPause());
        (_b = document.getElementById('btn-siguiente')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', () => this.next());
        (_c = document.getElementById('btn-anterior')) === null || _c === void 0 ? void 0 : _c.addEventListener('click', () => this.previous());
        // Funcionalidades avanzadas
        (_d = document.getElementById('btn-aleatorio')) === null || _d === void 0 ? void 0 : _d.addEventListener('click', () => this.toggleShuffleMode());
        (_e = document.getElementById('btn-repetir')) === null || _e === void 0 ? void 0 : _e.addEventListener('click', () => this.toggleRepeatMode());
        (_f = document.getElementById('btn-mover-inicio')) === null || _f === void 0 ? void 0 : _f.addEventListener('click', () => {
            if (this.playlist.moveCurrentToStart()) {
                this.renderPlaylist();
            }
        });
        (_g = document.getElementById('btn-mover-final')) === null || _g === void 0 ? void 0 : _g.addEventListener('click', () => {
            if (this.playlist.moveCurrentToEnd()) {
                this.renderPlaylist();
            }
        });
        // Carga de canciones
        const fileInput = document.getElementById('file-input');
        (_h = document.getElementById('btn-cargar-canciones')) === null || _h === void 0 ? void 0 : _h.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => this.handleFileInput(e));
        // Eventos del reproductor
        this.audio.addEventListener('timeupdate', () => this.updateProgressBar());
        this.audio.addEventListener('ended', () => this.handleSongEnd());
        this.audio.addEventListener('loadedmetadata', () => this.updateSongDuration());
        // Barra de progreso interactiva
        const progressBar = document.getElementById('progreso');
        progressBar.addEventListener('input', () => {
            if (this.audio.duration) {
                const seekTime = (parseInt(progressBar.value) / 100) * this.audio.duration;
                this.audio.currentTime = seekTime;
            }
        });
    }
    handleFileInput(event) {
        const input = event.target;
        if (input.files && input.files.length > 0) {
            this.processFiles(input.files);
        }
    }
    processFiles(files) {
        return __awaiter(this, void 0, void 0, function* () {
            const positionSelect = document.getElementById('posicion-agregar');
            const addPosition = positionSelect.value;
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                if (file.name.endsWith('.mp3')) {
                    const song = yield this.createSongFromFile(file);
                    switch (addPosition) {
                        case 'start':
                            this.playlist.addToStart(song);
                            break;
                        case 'end':
                            this.playlist.addToEnd(song);
                            break;
                        case 'after-current':
                            this.playlist.addAfterCurrent(song);
                            break;
                    }
                }
            }
            this.renderPlaylist();
            alert(`${files.length} canciones cargadas exitosamente!`);
        });
    }
    createSongFromFile(file) {
        return __awaiter(this, void 0, void 0, function* () {
            // Extraer el nombre del archivo sin la extensión
            const fileName = file.name.replace(/\.mp3$/, '');
            const fileUrl = URL.createObjectURL(file);
            return {
                id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                title: fileName,
                artist: 'Artista Desconocido',
                source: fileUrl,
                cover: 'img/default-cover.jpg'
            };
        });
    }
    setupVolumeControl() {
        const volumeControl = document.getElementById('volumen');
        volumeControl.value = (this.currentVolume * 100).toString();
        volumeControl.addEventListener('input', () => {
            this.currentVolume = parseInt(volumeControl.value) / 100;
            this.audio.volume = this.currentVolume;
        });
    }
    togglePlayPause() {
        if (this.audio.paused) {
            this.play();
        }
        else {
            this.pause();
        }
    }
    play() {
        if (!this.audio.src && this.playlist.getSize() > 0) {
            const firstSong = this.playlist.getList()[0];
            this.playSong(firstSong.id);
        }
        else {
            this.audio.play()
                .then(() => {
                this.isPlaying = true;
                this.updatePlayPauseIcon(true);
            })
                .catch(error => console.error('Error al reproducir:', error));
        }
    }
    pause() {
        this.audio.pause();
        this.isPlaying = false;
        this.updatePlayPauseIcon(false);
    }
    playSong(id) {
        try {
            this.playlist.playSong(id);
            const song = this.playlist.getCurrentSong();
            if (song) {
                this.updateSongInfo(song);
                this.audio.src = song.source;
                this.audio.volume = this.currentVolume;
                this.audio.load();
                this.audio.play()
                    .then(() => {
                    this.isPlaying = true;
                    this.updatePlayPauseIcon(true);
                    this.highlightActiveSong(id);
                })
                    .catch(error => console.error('Error al reproducir:', error));
            }
        }
        catch (error) {
            console.error('Error al reproducir canción:', error);
        }
    }
    next() {
        if (this.isShuffle) {
            const randomSong = this.playlist.getRandomSong();
            if (randomSong) {
                this.playSong(randomSong.id);
            }
        }
        else {
            const nextSong = this.playlist.nextSong();
            if (nextSong) {
                this.playSong(nextSong.id);
            }
            else if (this.isRepeat) {
                const firstSong = this.playlist.getList()[0];
                if (firstSong) {
                    this.playSong(firstSong.id);
                }
            }
        }
    }
    previous() {
        const prevSong = this.playlist.previousSong();
        if (prevSong) {
            this.playSong(prevSong.id);
        }
    }
    toggleShuffleMode() {
        this.isShuffle = !this.isShuffle;
        const shuffleIcon = document.getElementById('icono-aleatorio');
        if (shuffleIcon) {
            shuffleIcon.classList.toggle('activo', this.isShuffle);
        }
    }
    toggleRepeatMode() {
        this.isRepeat = !this.isRepeat;
        this.audio.loop = this.isRepeat;
        const repeatIcon = document.getElementById('icono-repetir');
        if (repeatIcon) {
            repeatIcon.classList.toggle('activo', this.isRepeat);
        }
    }
    handleSongEnd() {
        if (!this.isRepeat) {
            this.next();
        }
    }
    renderPlaylist() {
        const playlistElement = document.getElementById('lista-canciones');
        if (!playlistElement)
            return;
        playlistElement.innerHTML = '';
        const currentSong = this.playlist.getCurrentSong();
        this.playlist.getList().forEach(song => {
            const songElement = document.createElement('li');
            songElement.className = `cancion ${(currentSong === null || currentSong === void 0 ? void 0 : currentSong.id) === song.id ? 'activa' : ''}`;
            songElement.dataset.id = song.id;
            songElement.innerHTML = `
                <img src="${song.cover}" alt="${song.title}" class="portada-cancion">
                <div class="info-cancion">
                    <span class="titulo-cancion">${song.title}</span>
                    <span class="artista-cancion">${song.artist}</span>
                </div>
                <button class="btn-eliminar" data-id="${song.id}">
                    <i class="bi bi-trash"></i>
                </button>
            `;
            songElement.addEventListener('click', () => this.playSong(song.id));
            const deleteBtn = songElement.querySelector('.btn-eliminar');
            deleteBtn === null || deleteBtn === void 0 ? void 0 : deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.removeSong(song.id);
            });
            playlistElement.appendChild(songElement);
        });
    }
    removeSong(id) {
        var _a;
        if (confirm('¿Estás seguro de eliminar esta canción?')) {
            const wasCurrent = ((_a = this.playlist.getCurrentSong()) === null || _a === void 0 ? void 0 : _a.id) === id;
            this.playlist.removeSong(id);
            this.renderPlaylist();
            if (wasCurrent) {
                if (this.playlist.getSize() > 0) {
                    this.playSong(this.playlist.getList()[0].id);
                }
                else {
                    this.stopPlayback();
                }
            }
        }
    }
    stopPlayback() {
        this.audio.pause();
        this.audio.src = '';
        this.isPlaying = false;
        this.updateSongInfo({
            id: '',
            title: 'Sin canción',
            artist: 'Selecciona una canción',
            source: '',
            cover: ''
        });
        this.updatePlayPauseIcon(false);
    }
    updateSongInfo(song) {
        const titleElement = document.getElementById('titulo-cancion');
        const artistElement = document.getElementById('artista-cancion');
        const coverElement = document.getElementById('portada-cancion');
        if (titleElement)
            titleElement.textContent = song.title;
        if (artistElement)
            artistElement.textContent = song.artist;
        if (coverElement)
            coverElement.src = song.cover;
    }
    highlightActiveSong(id) {
        document.querySelectorAll('.cancion').forEach(element => {
            element.classList.remove('activa');
            if (element.getAttribute('data-id') === id) {
                element.classList.add('activa');
            }
        });
    }
    updatePlayPauseIcon(playing) {
        const icon = document.getElementById('icono-play-pause');
        if (icon) {
            icon.className = playing ? 'bi bi-pause-fill' : 'bi bi-play-fill';
        }
    }
    updateProgressBar() {
        const progress = document.getElementById('progreso');
        const currentTime = document.getElementById('tiempo-actual');
        if (this.audio.duration) {
            progress.value = (this.audio.currentTime / this.audio.duration * 100).toString();
        }
        if (currentTime) {
            currentTime.textContent = this.formatTime(this.audio.currentTime);
        }
    }
    updateSongDuration() {
        const totalTime = document.getElementById('tiempo-total');
        if (totalTime) {
            totalTime.textContent = this.formatTime(this.audio.duration || 0);
        }
    }
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    }
}
// Inicializar el reproductor cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new MusicPlayer();
});

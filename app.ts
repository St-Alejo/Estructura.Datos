interface Song {
    id: string;
    title: string;
    artist: string;
    source: string;
    cover: string;
    duration?: number;
}

class SongNode {
    song: Song;
    next: SongNode | null;
    prev: SongNode | null;

    constructor(song: Song) {
        this.song = song;
        this.next = null;
        this.prev = null;
    }
}

class Playlist {
    private head: SongNode | null;
    private tail: SongNode | null;
    private current: SongNode | null;
    private size: number;

    constructor() {
        this.head = null;
        this.tail = null;
        this.current = null;
        this.size = 0;
    }

    playSong(id: string): void {
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

    addToStart(song: Song): void {
        const newNode = new SongNode(song);
        
        if (!this.head) {
            this.head = newNode;
            this.tail = newNode;
            this.current = newNode;
        } else {
            newNode.next = this.head;
            this.head.prev = newNode;
            this.head = newNode;
        }
        this.size++;
    }

    addToEnd(song: Song): void {
        const newNode = new SongNode(song);
        
        if (!this.head) {
            this.head = newNode;
            this.tail = newNode;
            this.current = newNode;
        } else {
            newNode.prev = this.tail;
            if (this.tail) {
                this.tail.next = newNode;
            }
            this.tail = newNode;
        }
        this.size++;
    }

    addAfterCurrent(song: Song): void {
        if (!this.current) {
            this.addToEnd(song);
            return;
        }

        const newNode = new SongNode(song);
        newNode.prev = this.current;
        newNode.next = this.current.next;

        if (this.current.next) {
            this.current.next.prev = newNode;
        } else {
            this.tail = newNode;
        }

        this.current.next = newNode;
        this.size++;
    }

    moveCurrentToStart(): boolean {
        if (!this.current || this.size <= 1 || this.current === this.head) {
            return false;
        }

        const currentSong = this.current.song;
        this.removeSong(currentSong.id);
        this.addToStart(currentSong);
        this.playSong(currentSong.id);
        return true;
    }

    moveCurrentToEnd(): boolean {
        if (!this.current || this.size <= 1 || this.current === this.tail) {
            return false;
        }

        const currentSong = this.current.song;
        this.removeSong(currentSong.id);
        this.addToEnd(currentSong);
        this.playSong(currentSong.id);
        return true;
    }

    removeSong(id: string): void {
        let current = this.head;

        while (current) {
            if (current.song.id === id) {
                if (this.size === 1) {
                    this.head = null;
                    this.tail = null;
                    this.current = null;
                } else if (current === this.head) {
                    this.head = current.next;
                    if (this.head) this.head.prev = null;
                } else if (current === this.tail) {
                    this.tail = current.prev;
                    if (this.tail) this.tail.next = null;
                } else {
                    if (current.prev) current.prev.next = current.next;
                    if (current.next) current.next.prev = current.prev;
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

    getCurrentSong(): Song | null {
        return this.current ? this.current.song : null;
    }

    nextSong(): Song | null {
        if (!this.current) return null;
        this.current = this.current.next || this.head;
        return this.current ? this.current.song : null;
    }

    previousSong(): Song | null {
        if (!this.current) return null;
        this.current = this.current.prev || this.tail;
        return this.current ? this.current.song : null;
    }

    getRandomSong(): Song | null {
        const songs = this.getList();
        if (songs.length === 0) return null;
        const randomIndex = Math.floor(Math.random() * songs.length);
        return songs[randomIndex];
    }

    getList(): Song[] {
        const list: Song[] = [];
        let current = this.head;

        while (current) {
            list.push(current.song);
            current = current.next;
        }

        return list;
    }

    shuffle(): void {
        const songs = this.getList();
        for (let i = songs.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [songs[i], songs[j]] = [songs[j], songs[i]];
        }

        this.head = null;
        this.tail = null;
        const currentSongId = this.current?.song.id;
        this.current = null;
        this.size = 0;

        songs.forEach(song => this.addToEnd(song));
        
        if (currentSongId) {
            try {
                this.playSong(currentSongId);
            } catch (error) {
                console.warn('La canción actual no se encontró después del shuffle');
            }
        }
    }

    getSize(): number {
        return this.size;
    }
}

class MusicPlayer {
    private playlist: Playlist;
    private audio: HTMLAudioElement;
    private isPlaying: boolean = false;
    private isShuffle: boolean = false;
    private isRepeat: boolean = false;
    private currentVolume: number = 1;

    constructor() {
        this.playlist = new Playlist();
        this.audio = new Audio();
        this.initialize();
    }

    private initialize(): void {
        this.loadInitialSongs();
        this.setupEventListeners();
        this.renderPlaylist();
        this.setupVolumeControl();
        
        if (this.playlist.getSize() > 0) {
            this.playSong(this.playlist.getList()[0].id);
        }
    }

    private loadInitialSongs(): void {
        const initialSongs: Song[] = [
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

    private setupEventListeners(): void {
        // Controles básicos
        document.getElementById('btn-play-pause')?.addEventListener('click', () => this.togglePlayPause());
        document.getElementById('btn-siguiente')?.addEventListener('click', () => this.next());
        document.getElementById('btn-anterior')?.addEventListener('click', () => this.previous());

        // Funcionalidades avanzadas
        document.getElementById('btn-aleatorio')?.addEventListener('click', () => this.toggleShuffleMode());
        document.getElementById('btn-repetir')?.addEventListener('click', () => this.toggleRepeatMode());
        document.getElementById('btn-mover-inicio')?.addEventListener('click', () => {
            if (this.playlist.moveCurrentToStart()) {
                this.renderPlaylist();
            }
        });
        document.getElementById('btn-mover-final')?.addEventListener('click', () => {
            if (this.playlist.moveCurrentToEnd()) {
                this.renderPlaylist();
            }
        });

        // Carga de canciones
        const fileInput = document.getElementById('file-input') as HTMLInputElement;
        document.getElementById('btn-cargar-canciones')?.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => this.handleFileInput(e));

        // Eventos del reproductor
        this.audio.addEventListener('timeupdate', () => this.updateProgressBar());
        this.audio.addEventListener('ended', () => this.handleSongEnd());
        this.audio.addEventListener('loadedmetadata', () => this.updateSongDuration());

        // Barra de progreso interactiva
        const progressBar = document.getElementById('progreso') as HTMLInputElement;
        progressBar.addEventListener('input', () => {
            if (this.audio.duration) {
                const seekTime = (parseInt(progressBar.value) / 100) * this.audio.duration;
                this.audio.currentTime = seekTime;
            }
        });
    }

    private handleFileInput(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            this.processFiles(input.files);
        }
    }

    private async processFiles(files: FileList): Promise<void> {
        const positionSelect = document.getElementById('posicion-agregar') as HTMLSelectElement;
        const addPosition = positionSelect.value;
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (file.name.endsWith('.mp3')) {
                const song = await this.createSongFromFile(file);
                
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
    }

    private async createSongFromFile(file: File): Promise<Song> {
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
    }

    private setupVolumeControl(): void {
        const volumeControl = document.getElementById('volumen') as HTMLInputElement;
        volumeControl.value = (this.currentVolume * 100).toString();
        volumeControl.addEventListener('input', () => {
            this.currentVolume = parseInt(volumeControl.value) / 100;
            this.audio.volume = this.currentVolume;
        });
    }

    private togglePlayPause(): void {
        if (this.audio.paused) {
            this.play();
        } else {
            this.pause();
        }
    }

    private play(): void {
        if (!this.audio.src && this.playlist.getSize() > 0) {
            const firstSong = this.playlist.getList()[0];
            this.playSong(firstSong.id);
        } else {
            this.audio.play()
                .then(() => {
                    this.isPlaying = true;
                    this.updatePlayPauseIcon(true);
                })
                .catch(error => console.error('Error al reproducir:', error));
        }
    }

    private pause(): void {
        this.audio.pause();
        this.isPlaying = false;
        this.updatePlayPauseIcon(false);
    }

    private playSong(id: string): void {
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
        } catch (error) {
            console.error('Error al reproducir canción:', error);
        }
    }

    private next(): void {
        if (this.isShuffle) {
            const randomSong = this.playlist.getRandomSong();
            if (randomSong) {
                this.playSong(randomSong.id);
            }
        } else {
            const nextSong = this.playlist.nextSong();
            if (nextSong) {
                this.playSong(nextSong.id);
            } else if (this.isRepeat) {
                const firstSong = this.playlist.getList()[0];
                if (firstSong) {
                    this.playSong(firstSong.id);
                }
            }
        }
    }

    private previous(): void {
        const prevSong = this.playlist.previousSong();
        if (prevSong) {
            this.playSong(prevSong.id);
        }
    }

    private toggleShuffleMode(): void {
        this.isShuffle = !this.isShuffle;
        const shuffleIcon = document.getElementById('icono-aleatorio');
        if (shuffleIcon) {
            shuffleIcon.classList.toggle('activo', this.isShuffle);
        }
    }

    private toggleRepeatMode(): void {
        this.isRepeat = !this.isRepeat;
        this.audio.loop = this.isRepeat;
        const repeatIcon = document.getElementById('icono-repetir');
        if (repeatIcon) {
            repeatIcon.classList.toggle('activo', this.isRepeat);
        }
    }

    private handleSongEnd(): void {
        if (!this.isRepeat) {
            this.next();
        }
    }

    private renderPlaylist(): void {
        const playlistElement = document.getElementById('lista-canciones');
        if (!playlistElement) return;

        playlistElement.innerHTML = '';
        const currentSong = this.playlist.getCurrentSong();

        this.playlist.getList().forEach(song => {
            const songElement = document.createElement('li');
            songElement.className = `cancion ${currentSong?.id === song.id ? 'activa' : ''}`;
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
            deleteBtn?.addEventListener('click', (e) => {
                e.stopPropagation();
                this.removeSong(song.id);
            });

            playlistElement.appendChild(songElement);
        });
    }

    private removeSong(id: string): void {
        if (confirm('¿Estás seguro de eliminar esta canción?')) {
            const wasCurrent = this.playlist.getCurrentSong()?.id === id;
            this.playlist.removeSong(id);
            this.renderPlaylist();
            
            if (wasCurrent) {
                if (this.playlist.getSize() > 0) {
                    this.playSong(this.playlist.getList()[0].id);
                } else {
                    this.stopPlayback();
                }
            }
        }
    }

    private stopPlayback(): void {
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

    private updateSongInfo(song: Song): void {
        const titleElement = document.getElementById('titulo-cancion');
        const artistElement = document.getElementById('artista-cancion');
        const coverElement = document.getElementById('portada-cancion') as HTMLImageElement;

        if (titleElement) titleElement.textContent = song.title;
        if (artistElement) artistElement.textContent = song.artist;
        if (coverElement) coverElement.src = song.cover;
    }

    private highlightActiveSong(id: string): void {
        document.querySelectorAll('.cancion').forEach(element => {
            element.classList.remove('activa');
            if (element.getAttribute('data-id') === id) {
                element.classList.add('activa');
            }
        });
    }

    private updatePlayPauseIcon(playing: boolean): void {
        const icon = document.getElementById('icono-play-pause');
        if (icon) {
            icon.className = playing ? 'bi bi-pause-fill' : 'bi bi-play-fill';
        }
    }

    private updateProgressBar(): void {
        const progress = document.getElementById('progreso') as HTMLInputElement;
        const currentTime = document.getElementById('tiempo-actual');

        if (this.audio.duration) {
            progress.value = (this.audio.currentTime / this.audio.duration * 100).toString();
        }

        if (currentTime) {
            currentTime.textContent = this.formatTime(this.audio.currentTime);
        }
    }

    private updateSongDuration(): void {
        const totalTime = document.getElementById('tiempo-total');
        if (totalTime) {
            totalTime.textContent = this.formatTime(this.audio.duration || 0);
        }
    }

    private formatTime(seconds: number): string {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    }
}

// Inicializar el reproductor cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new MusicPlayer();
});
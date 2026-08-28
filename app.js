/* =========================================================
   AI MUSIC — APP.JS
   Front-end music community
   ========================================================= */

/* =========================
   SAMPLE MUSIC
========================= */

const defaultSongs = [
    {
        id: 1,
        title: "Blood Moon",
        artist: "M Mehrad",
        genre: "Dark Pop",
        emoji: "🌙",
        plays: 8420,
        likes: 1240,
        liked: false,
        saved: false,
        following: false
    },
    {
        id: 2,
        title: "Neon Dreams",
        artist: "Luna AI",
        genre: "Electronic",
        emoji: "🌌",
        plays: 7210,
        likes: 986,
        liked: false,
        saved: false,
        following: false
    },
    {
        id: 3,
        title: "Lost Again",
        artist: "Echo",
        genre: "R&B",
        emoji: "🖤",
        plays: 6340,
        likes: 812,
        liked: false,
        saved: false,
        following: false
    },
    {
        id: 4,
        title: "Digital Heart",
        artist: "Nova",
        genre: "Pop",
        emoji: "💜",
        plays: 5980,
        likes: 745,
        liked: false,
        saved: false,
        following: false
    },
    {
        id: 5,
        title: "Into The Night",
        artist: "Midnight",
        genre: "Cinematic",
        emoji: "🌃",
        plays: 5120,
        likes: 690,
        liked: false,
        saved: false,
        following: false
    },
    {
        id: 6,
        title: "Broken Signals",
        artist: "Static",
        genre: "Rock",
        emoji: "⚡",
        plays: 4760,
        likes: 601,
        liked: false,
        saved: false,
        following: false
    },
    {
        id: 7,
        title: "Future Love",
        artist: "Aria",
        genre: "Pop",
        emoji: "✨",
        plays: 4310,
        likes: 577,
        liked: false,
        saved: false,
        following: false
    },
    {
        id: 8,
        title: "After Midnight",
        artist: "Void",
        genre: "Ambient",
        emoji: "🌑",
        plays: 3890,
        likes: 498,
        liked: false,
        saved: false,
        following: false
    }
];


/* =========================
   STORAGE
========================= */

let songs =
    JSON.parse(localStorage.getItem("aiMusicSongs"))
    || defaultSongs;

let playlists =
    JSON.parse(localStorage.getItem("aiMusicPlaylists"))
    || [];

let likedSongs =
    JSON.parse(localStorage.getItem("aiMusicLiked"))
    || [];

let savedSongs =
    JSON.parse(localStorage.getItem("aiMusicSaved"))
    || [];

let followedArtists =
    JSON.parse(localStorage.getItem("aiMusicFollowing"))
    || [];

let currentSongIndex = -1;

let isPlaying = false;

let audio = new Audio();


/* =========================
   DOM
========================= */

const musicGrid =
    document.getElementById("musicGrid");

const trendingGrid =
    document.getElementById("trendingGrid");

const newGrid =
    document.getElementById("newGrid");

const followingGrid =
    document.getElementById("followingGrid");

const playlistGrid =
    document.getElementById("playlistGrid");

const searchInput =
    document.getElementById("searchInput");

const musicPlayer =
    document.getElementById("musicPlayer");

const playerTitle =
    document.getElementById("playerTitle");

const playerArtist =
    document.getElementById("playerArtist");

const playerCover =
    document.getElementById("playerCover");

const playButton =
    document.getElementById("playButton");

const progressBar =
    document.getElementById("progressBar");

const currentTimeElement =
    document.getElementById("currentTime");

const durationElement =
    document.getElementById("duration");

const toast =
    document.getElementById("toast");


/* =========================
   SAVE DATA
========================= */

function saveData() {

    localStorage.setItem(
        "aiMusicSongs",
        JSON.stringify(songs)
    );

    localStorage.setItem(
        "aiMusicPlaylists",
        JSON.stringify(playlists)
    );

    localStorage.setItem(
        "aiMusicLiked",
        JSON.stringify(likedSongs)
    );

    localStorage.setItem(
        "aiMusicSaved",
        JSON.stringify(savedSongs)
    );

    localStorage.setItem(
        "aiMusicFollowing",
        JSON.stringify(followedArtists)
    );
}


/* =========================
   FORMAT NUMBERS
========================= */

function formatNumber(number) {

    if (number >= 1000000) {
        return (
            (number / 1000000)
            .toFixed(1)
            .replace(".0", "")
            + "M"
        );
    }

    if (number >= 1000) {
        return (
            (number / 1000)
            .toFixed(1)
            .replace(".0", "")
            + "K"
        );
    }

    return number;
}


/* =========================
   SONG CARD
========================= */

function createSongCard(song) {

    const isLiked =
        likedSongs.includes(song.id);

    const isSaved =
        savedSongs.includes(song.id);

    const isFollowing =
        followedArtists.includes(song.artist);

    return `
        <article
            class="music-card"
            data-id="${song.id}"
        >

            <div
                class="cover"
                onclick="playSongById(${song.id})"
            >
                ${song.emoji || "🎵"}
            </div>

            <div class="music-card-content">

                <h3>
                    ${escapeHTML(song.title)}
                </h3>

                <span class="artist">
                    ${escapeHTML(song.artist)}
                </span>

                <div class="song-meta">

                    <span>
                        ${escapeHTML(song.genre)}
                    </span>

                    <span>
                        ▶ ${formatNumber(song.plays)}
                    </span>

                </div>

                <div class="card-actions">

                    <button
                        onclick="event.stopPropagation(); playSongById(${song.id})"
                    >
                        ▶
                    </button>

                    <button
                        onclick="event.stopPropagation(); toggleLike(${song.id})"
                    >
                        ${isLiked ? "❤️" : "♡"}
                        ${formatNumber(song.likes)}
                    </button>

                    <button
                        onclick="event.stopPropagation(); toggleSave(${song.id})"
                    >
                        ${isSaved ? "🔖" : "🔖"}
                    </button>

                    <button
                        onclick="event.stopPropagation(); toggleFollow('${escapeAttribute(song.artist)}')"
                    >
                        ${isFollowing ? "Following" : "Follow"}
                    </button>

                </div>

            </div>

        </article>
    `;
}


/* =========================
   RENDER SONGS
========================= */

function renderSongs(list = songs) {

    if (!musicGrid) return;

    musicGrid.innerHTML =
        list.map(createSongCard).join("");

    renderTrending();
    renderNewReleases();
    renderFollowing();
}


/* =========================
   TRENDING
========================= */

function renderTrending() {

    if (!trendingGrid) return;

    const trending =
        [...songs]
        .sort((a, b) => b.plays - a.plays)
        .slice(0, 6);

    trendingGrid.innerHTML =
        trending.map(createSongCard).join("");
}


/* =========================
   NEW RELEASES
========================= */

function renderNewReleases() {

    if (!newGrid) return;

    const newest =
        [...songs]
        .reverse()
        .slice(0, 6);

    newGrid.innerHTML =
        newest.map(createSongCard).join("");
}


/* =========================
   FOLLOWING
========================= */

function renderFollowing() {

    if (!followingGrid) return;

    const following =
        songs.filter(song =>
            followedArtists.includes(song.artist)
        );

    if (!following.length) {

        followingGrid.innerHTML = `
            <div class="empty-state">
                <h3>No artists followed yet</h3>
                <p>
                    Follow artists to see their music here.
                </p>
            </div>
        `;

        return;
    }

    followingGrid.innerHTML =
        following.map(createSongCard).join("");
}


/* =========================
   LIKE
========================= */

function toggleLike(id) {

    const song =
        songs.find(item => item.id === id);

    if (!song) return;

    if (likedSongs.includes(id)) {

        likedSongs =
            likedSongs.filter(item => item !== id);

        song.likes =
            Math.max(0, song.likes - 1);

        showToast("Removed from liked songs");

    } else {

        likedSongs.push(id);

        song.likes++;

        showToast("Added to liked songs ❤️");
    }

    saveData();
    renderSongs();
}


/* =========================
   SAVE
========================= */

function toggleSave(id) {

    if (savedSongs.includes(id)) {

        savedSongs =
            savedSongs.filter(item => item !== id);

        showToast("Removed from saved songs");

    } else {

        savedSongs.push(id);

        showToast("Song saved 🔖");
    }

    saveData();
    renderSongs();
}


/* =========================
   FOLLOW
========================= */

function toggleFollow(artist) {

    if (followedArtists.includes(artist)) {

        followedArtists =
            followedArtists.filter(
                item => item !== artist
            );

        showToast(`Unfollowed ${artist}`);

    } else {

        followedArtists.push(artist);

        showToast(`Following ${artist} 👤`);
    }

    saveData();
    renderSongs();
}


/* =========================
   PLAY SONG
========================= */

function playSongById(id) {

    const index =
        songs.findIndex(song => song.id === id);

    if (index === -1) return;

    currentSongIndex = index;

    const song =
        songs[currentSongIndex];

    loadSong(song);

    song.plays++;

    saveData();

    renderSongs();

    audio.play()
        .then(() => {

            isPlaying = true;

            updatePlayButton();

        })
        .catch(() => {

            isPlaying = false;

            updatePlayButton();

            showToast(
                "This demo song has no audio file yet."
            );
        });
}


/* =========================
   LOAD SONG
========================= */

function loadSong(song) {

    musicPlayer.classList.remove("hidden");

    playerTitle.textContent =
        song.title;

    playerArtist.textContent =
        song.artist;

    playerCover.textContent =
        song.emoji || "🎵";

    if (song.audio) {
        audio.src = song.audio;
        audio.load();
    } else {
        audio.removeAttribute("src");
    }

    progressBar.value = 0;

    currentTimeElement.textContent =
        "0:00";

    durationElement.textContent =
        "0:00";
}


/* =========================
   TOGGLE PLAY
========================= */

function togglePlay() {

    if (currentSongIndex === -1) {

        if (songs.length) {
            playSongById(songs[0].id);
        }

        return;
    }

    const song =
        songs[currentSongIndex];

    if (!song.audio) {

        showToast(
            "Upload an audio file to play this song."
        );

        return;
    }

    if (isPlaying) {

        audio.pause();

        isPlaying = false;

    } else {

        audio.play();

        isPlaying = true;
    }

    updatePlayButton();
}


/* =========================
   PLAY BUTTON
========================= */

function updatePlayButton() {

    if (!playButton) return;

    playButton.textContent =
        isPlaying ? "❚❚" : "▶";
}


/* =========================
   NEXT SONG
========================= */

function nextSong() {

    if (!songs.length) return;

    if (currentSongIndex === -1) {

        playSongById(songs[0].id);

        return;
    }

    currentSongIndex =
        (currentSongIndex + 1)
        % songs.length;

    playSongById(
        songs[currentSongIndex].id
    );
}


/* =========================
   PREVIOUS SONG
========================= */

function previousSong() {

    if (!songs.length) return;

    if (currentSongIndex === -1) {

        playSongById(songs[0].id);

        return;
    }

    currentSongIndex =
        (currentSongIndex - 1 + songs.length)
        % songs.length;

    playSongById(
        songs[currentSongIndex].id
    );
}


/* =========================
   AUDIO EVENTS
========================= */

audio.addEventListener(
    "loadedmetadata",
    () => {

        durationElement.textContent =
            formatTime(audio.duration);

        progressBar.max =
            audio.duration;
    }
);


audio.addEventListener(
    "timeupdate",
    () => {

        if (!audio.duration) return;

        progressBar.value =
            audio.currentTime;

        currentTimeElement.textContent =
            formatTime(audio.currentTime);
    }
);


audio.addEventListener(
    "play",
    () => {

        isPlaying = true;

        updatePlayButton();
    }
);


audio.addEventListener(
    "pause",
    () => {

        isPlaying = false;

        updatePlayButton();
    }
);


audio.addEventListener(
    "ended",
    () => {

        isPlaying = false;

        updatePlayButton();

        nextSong();
    }
);


progressBar.addEventListener(
    "input",
    () => {

        audio.currentTime =
            Number(progressBar.value);
    }
);


/* =========================
   FORMAT TIME
========================= */

function formatTime(seconds) {

    if (!seconds || isNaN(seconds)) {
        return "0:00";
    }

    const minutes =
        Math.floor(seconds / 60);

    const remaining =
        Math.floor(seconds % 60);

    return (
        minutes +
        ":" +
        String(remaining).padStart(2, "0")
    );
}


/* =========================
   SEARCH
========================= */

if (searchInput) {

    searchInput.addEventListener(
        "input",
        () => {

            const query =
                searchInput.value
                .trim()
                .toLowerCase();

            if (!query) {

                renderSongs();

                return;
            }

            const results =
                songs.filter(song =>

                    song.title
                    .toLowerCase()
                    .includes(query)

                    ||

                    song.artist
                    .toLowerCase()
                    .includes(query)

                    ||

                    song.genre
                    .toLowerCase()
                    .includes(query)
                );

            renderSongs(results);

            if (!results.length) {

                musicGrid.innerHTML = `
                    <div class="empty-state">
                        <h3>No results found</h3>
                        <p>
                            Try another song, artist or genre.
                        </p>
                    </div>
                `;
            }
        }
    );
}


/* =========================
   SHOW ALL
========================= */

function showAllSongs() {

    if (searchInput) {
        searchInput.value = "";
    }

    renderSongs();

    scrollToSection("explore");
}


/* =========================
   PLAYLISTS
========================= */

function createPlaylist() {

    const modal =
        document.getElementById("playlistModal");

    if (!modal) return;

    modal.classList.remove("hidden");
}


function closePlaylistModal() {

    const modal =
        document.getElementById("playlistModal");

    if (!modal) return;

    modal.classList.add("hidden");
}


const playlistForm =
    document.getElementById("playlistForm");


if (playlistForm) {

    playlistForm.addEventListener(
        "submit",
        event => {

            event.preventDefault();

            const input =
                document.getElementById("playlistName");

            const name =
                input.value.trim();

            if (!name) return;

            playlists.push({

                id: Date.now(),

                name: name,

                songs: []

            });

            saveData();

            input.value = "";

            closePlaylistModal();

            renderPlaylists();

            showToast(
                "Playlist created 🎵"
            );
        }
    );
}


/* =========================
   RENDER PLAYLISTS
========================= */

function renderPlaylists() {

    if (!playlistGrid) return;

    if (!playlists.length) {

        playlistGrid.innerHTML = `
            <div class="playlist-card">
                <div class="playlist-icon">
                    🎵
                </div>

                <h3>
                    No playlists yet
                </h3>

                <p>
                    Create your first playlist.
                </p>
            </div>
        `;

        return;
    }

    playlistGrid.innerHTML =
        playlists.map(playlist => `

            <div
                class="playlist-card"
                onclick="openPlaylist(${playlist.id})"
            >

                <div class="playlist-icon">
                    🎧
                </div>

                <h3>
                    ${escapeHTML(playlist.name)}
                </h3>

                <p>
                    ${playlist.songs.length} songs
                </p>

            </div>

        `).join("");
}


/* =========================
   OPEN PLAYLIST
========================= */

function openPlaylist(id) {

    const playlist =
        playlists.find(
            item => item.id === id
        );

    if (!playlist) return;

    if (!playlist.songs.length) {

        showToast(
            "This playlist is empty."
        );

        return;
    }

    playSongById(
        playlist.songs[0]
    );
}


/* =========================
   UPLOAD MODAL
========================= */

function openUploadModal() {

    const modal =
        document.getElementById("uploadModal");

    if (!modal) return;

    modal.classList.remove("hidden");
}


function closeUploadModal() {

    const modal =
        document.getElementById("uploadModal");

    if (!modal) return;

    modal.classList.add("hidden");
}


/* =========================
   UPLOAD SONG
========================= */

const uploadForm =
    document.getElementById("uploadForm");


if (uploadForm) {

    uploadForm.addEventListener(
        "submit",
        event => {

            event.preventDefault();

            const title =
                document.getElementById(
                    "songTitle"
                ).value.trim();

            const artist =
                document.getElementById(
                    "artistName"
                ).value.trim();

            const genre =
                document.getElementById(
                    "songGenre"
                ).value;

            const audioInput =
                document.getElementById(
                    "audioInput"
                );

            const coverInput =
                document.getElementById(
                    "coverInput"
                );

            if (
                !title ||
                !artist ||
                !audioInput.files.length
            ) {

                showToast(
                    "Please complete the required fields."
                );

                return;
            }

            const audioFile =
                audioInput.files[0];

            const audioURL =
                URL.createObjectURL(
                    audioFile
                );

            let emoji = "🎵";

            const newSong = {

                id: Date.now(),

                title: title,

                artist: artist,

                genre: genre,

                emoji: emoji,

                audio: audioURL,

                plays: 0,

                likes: 0,

                liked: false,

                saved: false,

                following: false
            };

            /*
             IMPORTANT:

             Object URLs are temporary.
             They are good for this browser session.

             Later we will connect real
             cloud storage for permanent uploads.
            */

            songs.unshift(newSong);

            saveData();

            uploadForm.reset();

            closeUploadModal();

            renderSongs();

            showToast(
                "Song published successfully 🎉"
            );
        }
    );
}


/* =========================
   PROFILE
========================= */

function openProfile() {

    const profile =
        document.getElementById("profile");

    if (!profile) return;

    profile.classList.remove(
        "hidden-section"
    );

    profile.scrollIntoView({
        behavior: "smooth"
    });

    updateProfile();
}


function updateProfile() {

    const followers =
        document.getElementById(
            "followersCount"
        );

    const following =
        document.getElementById(
            "followingCount"
        );

    const songsCount =
        document.getElementById(
            "songsCount"
        );

    const plays =
        document.getElementById(
            "playsCount"
        );

    if (followers) {
        followers.textContent =
            followedArtists.length;
    }

    if (following) {
        following.textContent =
            followedArtists.length;
    }

    if (songsCount) {
        songsCount.textContent =
            songs.length;
    }

    if (plays) {

        const total =
            songs.reduce(
                (sum, song) =>
                    sum + song.plays,
                0
            );

        plays.textContent =
            formatNumber(total);
    }
}


function editProfile() {

    const name =
        prompt(
            "Enter your display name:"
        );

    if (!name) return;

    const profileName =
        document.getElementById(
            "profileName"
        );

    if (profileName) {
        profileName.textContent =
            name;
    }

    showToast(
        "Profile updated."
    );
}


/* =========================
   THEME
========================= */

const themeButton =
    document.getElementById(
        "themeButton"
    );


if (themeButton) {

    themeButton.addEventListener(
        "click",
        () => {

            document.body.classList.toggle(
                "light-mode"
            );

            const light =
                document.body.classList.contains(
                    "light-mode"
                );

            localStorage.setItem(
                "aiMusicTheme",
                light
                    ? "light"
                    : "dark"
            );

            themeButton.textContent =
                light ? "☀" : "☾";
        }
    );
}


function loadTheme() {

    const theme =
        localStorage.getItem(
            "aiMusicTheme"
        );

    if (theme === "light") {

        document.body.classList.add(
            "light-mode"
        );

        if (themeButton) {
            themeButton.textContent = "☀";
        }
    }
}


/* =========================
   NAVIGATION
========================= */

function scrollToSection(id) {

    const element =
        document.getElementById(id);

    if (!element) return;

    element.scrollIntoView({
        behavior: "smooth"
    });
}


/* =========================
   TOAST
========================= */

let toastTimer;

function showToast(message) {

    if (!toast) return;

    toast.textContent =
        message;

    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer =
        setTimeout(() => {

            toast.classList.remove(
                "show"
            );

        }, 2500);
}


/* =========================
   SECURITY HELPERS
========================= */

function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


function escapeAttribute(value) {

    return String(value)
        .replaceAll("\\", "\\\\")
        .replaceAll("'", "\\'");
}


/* =========================
   CLOSE MODALS
========================= */

window.addEventListener(
    "click",
    event => {

        const uploadModal =
            document.getElementById(
                "uploadModal"
            );

        const playlistModal =
            document.getElementById(
                "playlistModal"
            );

        if (
            event.target === uploadModal
        ) {
            closeUploadModal();
        }

        if (
            event.target === playlistModal
        ) {
            closePlaylistModal();
        }
    }
);


/* =========================
   INITIALIZE
========================= */

function initializeApp() {

    loadTheme();

    renderSongs();

    renderPlaylists();

    updateProfile();
}


/* =========================
   START
========================= */

initializeApp();

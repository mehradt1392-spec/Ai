/* =========================================================
   AI MUSIC — APP.JS
   Supabase-powered music community
   ========================================================= */


/* =========================
   SUPABASE
========================= */

const SUPABASE_URL =
    "https://rbvrzpmzqtbjhfxfckpr.supabase.co";

const SUPABASE_KEY =
    "   sb_publishable_75J1VdJpGb1h2FcjcMfHjw_ngSbruD9";

const supabaseClient =
    supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


/* =========================
   APP STATE
========================= */

let songs = [];

let playlists = [];

let likedSongs = [];

let savedSongs = [];

let followedArtists = [];

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
   AUTH
========================= */

async function getCurrentUser() {

    const {
        data,
        error
    } = await supabaseClient.auth.getUser();

    if (error) {
        console.error(error);
        return null;
    }

    return data.user;
}


/* =========================
   LOAD SONGS
========================= */

async function loadSongs() {

    const {
        data,
        error
    } = await supabaseClient
        .from("songs")
        .select("*")
        .order("created_at", {
            ascending: false
        });

    if (error) {

        console.error(
            "Failed to load songs:",
            error
        );

        showToast(
            "Failed to load songs."
        );

        return;
    }

    songs = data || [];

    renderSongs();
}


/* =========================
   LOAD USER DATA
========================= */

async function loadUserData() {

    const user =
        await getCurrentUser();

    if (!user) {

        likedSongs = [];
        savedSongs = [];
        followedArtists = [];
        playlists = [];

        return;
    }


    /* =========================
       LIKES
    ========================= */

    const {
        data: likesData,
        error: likesError
    } = await supabaseClient
        .from("likes")
        .select("song_id")
        .eq("user_id", user.id);

    if (!likesError) {

        likedSongs =
            (likesData || [])
            .map(item => item.song_id);
    }


    /* =========================
       SAVED SONGS
    ========================= */

    const {
        data: savedData,
        error: savedError
    } = await supabaseClient
        .from("saved_songs")
        .select("song_id")
        .eq("user_id", user.id);

    if (!savedError) {

        savedSongs =
            (savedData || [])
            .map(item => item.song_id);
    }


    /* =========================
       FOLLOWING
    ========================= */

    const {
        data: followsData,
        error: followsError
    } = await supabaseClient
        .from("follows")
        .select("following_id")
        .eq("follower_id", user.id);

    if (!followsError) {

        followedArtists =
            (followsData || [])
            .map(item => item.following_id);
    }


    /* =========================
       PLAYLISTS
    ========================= */

    const {
        data: playlistsData,
        error: playlistsError
    } = await supabaseClient
        .from("playlists")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", {
            ascending: false
        });

    if (!playlistsError) {

        playlists =
            playlistsData || [];
    }
}


/* =========================
   FORMAT NUMBERS
========================= */

function formatNumber(number) {

    number =
        Number(number) || 0;

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
   GET COVER URL
========================= */

function getCoverUrl(song) {

    if (!song.cover_url) {

        return "";
    }

    if (
        song.cover_url.startsWith(
            "http"
        )
    ) {

        return song.cover_url;
    }

    const {
        data
    } = supabaseClient
        .storage
        .from("covers")
        .getPublicUrl(
            song.cover_url
        );

    return data.publicUrl;
}


/* =========================
   GET AUDIO URL
========================= */

function getAudioUrl(song) {

    if (!song.audio_url) {

        return "";
    }

    if (
        song.audio_url.startsWith(
            "http"
        )
    ) {

        return song.audio_url;
    }

    const {
        data
    } = supabaseClient
        .storage
        .from("songs")
        .getPublicUrl(
            song.audio_url
        );

    return data.publicUrl;
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
        followedArtists.includes(
            song.artist_id
        );

    const coverUrl =
        getCoverUrl(song);


    return `
        <article
            class="music-card"
            data-id="${escapeHTML(song.id)}"
        >

            <div
                class="cover"
                onclick="playSongById('${escapeAttribute(song.id)}')"
            >

                ${
                    coverUrl
                    ? `
                        <img
                            src="${escapeAttribute(coverUrl)}"
                            alt="${escapeHTML(song.title)}"
                        >
                    `
                    : "🎵"
                }

            </div>


            <div class="music-card-content">

                <h3>
                    ${escapeHTML(
                        song.title || "Untitled"
                    )}
                </h3>


                <span class="artist">
                    ${escapeHTML(
                        song.artist_name ||
                        song.artist ||
                        "Unknown Artist"
                    )}
                </span>


                <div class="song-meta">

                    <span>
                        ${escapeHTML(
                            song.genre ||
                            "Unknown"
                        )}
                    </span>

                    <span>
                        ▶
                        ${formatNumber(
                            song.plays
                        )}
                    </span>

                </div>


                <div class="card-actions">

                    <button
                        onclick="event.stopPropagation(); playSongById('${escapeAttribute(song.id)}')"
                    >
                        ▶
                    </button>


                    <button
                        onclick="event.stopPropagation(); toggleLike('${escapeAttribute(song.id)}')"
                    >
                        ${isLiked ? "❤️" : "♡"}
                        ${formatNumber(
                            song.likes
                        )}
                    </button>


                    <button
                        onclick="event.stopPropagation(); toggleSave('${escapeAttribute(song.id)}')"
                    >
                        🔖
                    </button>


                    <button
                        onclick="event.stopPropagation(); toggleFollow('${escapeAttribute(song.artist_id || "")}')"
                    >
                        ${
                            isFollowing
                            ? "Following"
                            : "Follow"
                        }
                    </button>

                </div>

            </div>

        </article>
    `;
}


/* =========================
   RENDER SONGS
========================= */

function renderSongs(
    list = songs
) {

    if (!musicGrid) return;

    musicGrid.innerHTML =
        list
            .map(createSongCard)
            .join("");

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
            .sort(
                (a, b) =>
                    (b.plays || 0) -
                    (a.plays || 0)
            )
            .slice(0, 6);

    trendingGrid.innerHTML =
        trending
            .map(createSongCard)
            .join("");
}


/* =========================
   NEW RELEASES
========================= */

function renderNewReleases() {

    if (!newGrid) return;

    const newest =
        [...songs]
            .slice(0, 6);

    newGrid.innerHTML =
        newest
            .map(createSongCard)
            .join("");
}


/* =========================
   FOLLOWING
========================= */

function renderFollowing() {

    if (!followingGrid) return;

    const following =
        songs.filter(song =>
            followedArtists.includes(
                song.artist_id
            )
        );


    if (!following.length) {

        followingGrid.innerHTML = `
            <div class="empty-state">

                <h3>
                    No artists followed yet
                </h3>

                <p>
                    Follow artists to see their music here.
                </p>

            </div>
        `;

        return;
    }


    followingGrid.innerHTML =
        following
            .map(createSongCard)
            .join("");
}


/* =========================
   LIKE
========================= */

async function toggleLike(id) {

    const user =
        await getCurrentUser();

    if (!user) {

        showToast(
            "Please sign in to like songs."
        );

        return;
    }


    const song =
        songs.find(
            item =>
                String(item.id) ===
                String(id)
        );

    if (!song) return;


    if (
        likedSongs.includes(id)
    ) {

        const {
            error
        } = await supabaseClient
            .from("likes")
            .delete()
            .eq("song_id", id)
            .eq("user_id", user.id);


        if (error) {

            console.error(error);

            showToast(
                "Failed to remove like."
            );

            return;
        }


        likedSongs =
            likedSongs.filter(
                item =>
                    String(item) !==
                    String(id)
            );


        showToast(
            "Removed from liked songs"
        );

    } else {

        const {
            error
        } = await supabaseClient
            .from("likes")
            .insert({

                song_id: id,

                user_id: user.id

            });


        if (error) {

            console.error(error);

            showToast(
                "Failed to like song."
            );

            return;
        }


        likedSongs.push(id);


        showToast(
            "Added to liked songs ❤️"
        );
    }


    await loadSongs();
}


/* =========================
   SAVE
========================= */

async function toggleSave(id) {

    const user =
        await getCurrentUser();

    if (!user) {

        showToast(
            "Please sign in to save songs."
        );

        return;
    }


    if (
        savedSongs.includes(id)
    ) {

        const {
            error
        } = await supabaseClient
            .from("saved_songs")
            .delete()
            .eq("song_id", id)
            .eq("user_id", user.id);


        if (error) {

            console.error(error);

            showToast(
                "Failed to remove saved song."
            );

            return;
        }


        savedSongs =
            savedSongs.filter(
                item =>
                    String(item) !==
                    String(id)
            );


        showToast(
            "Removed from saved songs"
        );

    } else {

        const {
            error
        } = await supabaseClient
            .from("saved_songs")
            .insert({

                song_id: id,

                user_id: user.id

            });


        if (error) {

            console.error(error);

            showToast(
                "Failed to save song."
            );

            return;
        }


        savedSongs.push(id);


        showToast(
            "Song saved 🔖"
        );
    }
}


/* =========================
   FOLLOW
========================= */

async function toggleFollow(
    artistId
) {

    const user =
        await getCurrentUser();

    if (!user) {

        showToast(
            "Please sign in to follow artists."
        );

        return;
    }


    if (!artistId) {

        showToast(
            "Artist information is unavailable."
        );

        return;
    }


    if (
        followedArtists.includes(
            artistId
        )
    ) {

        const {
            error
        } = await supabaseClient
            .from("follows")
            .delete()
            .eq(
                "following_id",
                artistId
            )
            .eq(
                "follower_id",
                user.id
            );


        if (error) {

            console.error(error);

            showToast(
                "Failed to unfollow artist."
            );

            return;
        }


        followedArtists =
            followedArtists.filter(
                item =>
                    String(item) !==
                    String(artistId)
            );


        showToast(
            "Artist unfollowed"
        );

    } else {

        const {
            error
        } = await supabaseClient
            .from("follows")
            .insert({

                following_id:
                    artistId,

                follower_id:
                    user.id

            });


        if (error) {

            console.error(error);

            showToast(
                "Failed to follow artist."
            );

            return;
        }


        followedArtists.push(
            artistId
        );


        showToast(
            "Artist followed 👤"
        );
    }


    renderSongs();
}


/* =========================
   PLAY SONG
========================= */

async function playSongById(id) {

    const index =
        songs.findIndex(
            song =>
                String(song.id) ===
                String(id)
        );

    if (index === -1) return;

    currentSongIndex =
        index;

    const song =
        songs[currentSongIndex];

    loadSong(song);


    const audioUrl =
        getAudioUrl(song);


    if (!audioUrl) {

        showToast(
            "This song has no audio file."
        );

        return;
    }


    audio.src =
        audioUrl;

    audio.load();


    try {

        await audio.play();

        isPlaying = true;

        updatePlayButton();

    } catch (error) {

        console.error(error);

        isPlaying = false;

        updatePlayButton();

        showToast(
            "Unable to play this song."
        );
    }
}


/* =========================
   LOAD SONG
========================= */

function loadSong(song) {

    if (!musicPlayer) return;

    musicPlayer.classList.remove(
        "hidden"
    );


    if (playerTitle) {

        playerTitle.textContent =
            song.title ||
            "Untitled";
    }


    if (playerArtist) {

        playerArtist.textContent =
            song.artist_name ||
            song.artist ||
            "Unknown Artist";
    }


    if (playerCover) {

        const coverUrl =
            getCoverUrl(song);


        if (coverUrl) {

            playerCover.innerHTML = `
                <img
                    src="${escapeAttribute(coverUrl)}"
                    alt="${escapeHTML(song.title || "Song")}"
                >
            `;

        } else {

            playerCover.textContent =
                "🎵";
        }
    }


    if (progressBar) {

        progressBar.value =
            0;
    }


    if (currentTimeElement) {

        currentTimeElement.textContent =
            "0:00";
    }


    if (durationElement) {

        durationElement.textContent =
            "0:00";
    }
}


/* =========================
   TOGGLE PLAY
========================= */

function togglePlay() {

    if (
        currentSongIndex === -1
    ) {

        if (songs.length) {

            playSongById(
                songs[0].id
            );
        }

        return;
    }


    const song =
        songs[currentSongIndex];


    if (!getAudioUrl(song)) {

        showToast(
            "This song has no audio file."
        );

        return;
    }


    if (isPlaying) {

        audio.pause();

    } else {

        audio.play()
            .catch(error =>
                console.error(error)
            );
    }
}


/* =========================
   PLAY BUTTON
========================= */

function updatePlayButton() {

    if (!playButton) return;

    playButton.textContent =
        isPlaying
        ? "❚❚"
        : "▶";
}


/* =========================
   NEXT SONG
========================= */

function nextSong() {

    if (!songs.length) return;


    if (
        currentSongIndex === -1
    ) {

        playSongById(
            songs[0].id
        );

        return;
    }


    const nextIndex =
        (
            currentSongIndex +
            1
        ) % songs.length;


    playSongById(
        songs[nextIndex].id
    );
}


/* =========================
   PREVIOUS SONG
========================= */

function previousSong() {

    if (!songs.length) return;


    if (
        currentSongIndex === -1
    ) {

        playSongById(
            songs[0].id
        );

        return;
    }


    const previousIndex =
        (
            currentSongIndex -
            1 +
            songs.length
        ) % songs.length;


    playSongById(
        songs[previousIndex].id
    );
}


/* =========================
   AUDIO EVENTS
========================= */

audio.addEventListener(
    "loadedmetadata",
    () => {

        if (
            durationElement
        ) {

            durationElement.textContent =
                formatTime(
                    audio.duration
                );
        }


        if (
            progressBar
        ) {

            progressBar.max =
                audio.duration;
        }
    }
);


audio.addEventListener(
    "timeupdate",
    () => {

        if (!audio.duration)
            return;


        if (
            progressBar
        ) {

            progressBar.value =
                audio.currentTime;
        }


        if (
            currentTimeElement
        ) {

            currentTimeElement.textContent =
                formatTime(
                    audio.currentTime
                );
        }
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


if (progressBar) {

    progressBar.addEventListener(
        "input",
        () => {

            audio.currentTime =
                Number(
                    progressBar.value
                );
        }
    );
}


/* =========================
   FORMAT TIME
========================= */

function formatTime(
    seconds
) {

    if (
        !seconds ||
        isNaN(seconds)
    ) {

        return "0:00";
    }


    const minutes =
        Math.floor(
            seconds / 60
        );


    const remaining =
        Math.floor(
            seconds % 60
        );


    return (
        minutes +
        ":" +
        String(
            remaining
        ).padStart(
            2,
            "0"
        )
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
                songs.filter(
                    song => {

                        const title =
                            String(
                                song.title ||
                                ""
                            ).toLowerCase();


                        const artist =
                            String(
                                song.artist_name ||
                                song.artist ||
                                ""
                            ).toLowerCase();


                        const genre =
                            String(
                                song.genre ||
                                ""
                            ).toLowerCase();


                        return (
                            title.includes(
                                query
                            ) ||
                            artist.includes(
                                query
                            ) ||
                            genre.includes(
                                query
                            )
                        );
                    }
                );


            renderSongs(
                results
            );


            if (
                !results.length &&
                musicGrid
            ) {

                musicGrid.innerHTML = `
                    <div class="empty-state">

                        <h3>
                            No results found
                        </h3>

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

        searchInput.value =
            "";
    }


    renderSongs();

    scrollToSection(
        "explore"
    );
}


/* =========================
   CREATE PLAYLIST
========================= */

function createPlaylist() {

    const modal =
        document.getElementById(
            "playlistModal"
        );


    if (!modal) return;


    modal.classList.remove(
        "hidden"
    );
}


function closePlaylistModal() {

    const modal =
        document.getElementById(
            "playlistModal"
        );


    if (!modal) return;


    modal.classList.add(
        "hidden"
    );
}


/* =========================
   PLAYLIST FORM
========================= */

const playlistForm =
    document.getElementById(
        "playlistForm"
    );


if (playlistForm) {

    playlistForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const user =
                await getCurrentUser();


            if (!user) {

                showToast(
                    "Please sign in to create playlists."
                );

                return;
            }


            const input =
                document.getElementById(
                    "playlistName"
                );


            const name =
                input.value.trim();


            if (!name) return;


            const {
                data,
                error
            } = await supabaseClient
                .from("playlists")
                .insert({

                    name: name,

                    user_id:
                        user.id

                })
                .select()
                .single();


            if (error) {

                console.error(error);

                showToast(
                    "Failed to create playlist."
                );

                return;
            }


            playlists.unshift(
                data
            );


            input.value =
                "";


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
        playlists
            .map(
                playlist => `

                    <div
                        class="playlist-card"
                        onclick="openPlaylist('${escapeAttribute(playlist.id)}')"
                    >

                        <div class="playlist-icon">
                            🎧
                        </div>

                        <h3>
                            ${escapeHTML(
                                playlist.name
                            )}
                        </h3>

                        <p>
                            ${formatNumber(
                                playlist.song_count ||
                                0
                            )}
                            songs
                        </p>

                    </div>
                `
            )
            .join("");
}


/* =========================
   OPEN PLAYLIST
========================= */

async function openPlaylist(id) {

    const user =
        await getCurrentUser();


    if (!user) {

        showToast(
            "Please sign in to open playlists."
        );

        return;
    }


    const {
        data,
        error
    } = await supabaseClient
        .from("playlist_songs")
        .select(
            "song_id"
        )
        .eq(
            "playlist_id",
            id
        )
        .order(
            "created_at",
            {
                ascending: true
            }
        );


    if (error) {

        console.error(error);

        showToast(
            "Failed to open playlist."
        );

        return;
    }


    if (!data || !data.length) {

        showToast(
            "This playlist is empty."
        );

        return;
    }


    const firstSong =
        data[0].song_id;


    playSongById(
        firstSong
    );
}


/* =========================
   UPLOAD MODAL
========================= */

function openUploadModal() {

    const modal =
        document.getElementById(
            "uploadModal"
        );


    if (!modal) return;


    modal.classList.remove(
        "hidden"
    );
}


function closeUploadModal() {

    const modal =
        document.getElementById(
            "uploadModal"
        );


    if (!modal) return;


    modal.classList.add(
        "hidden"
    );
}


/* =========================
   UPLOAD SONG
========================= */

const uploadForm =
    document.getElementById(
        "uploadForm"
    );


if (uploadForm) {

    uploadForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const user =
                await getCurrentUser();


            if (!user) {

                showToast(
                    "Please sign in to upload songs."
                );

                return;
            }


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
                !audioInput ||
                !audioInput.files.length
            ) {

                showToast(
                    "Please complete the required fields."
                );

                return;
            }


            const audioFile =
                audioInput.files[0];


            const audioExtension =
                audioFile.name
                    .split(".")
                    .pop();


            const audioPath =
                `${user.id}/${crypto.randomUUID()}.${audioExtension}`;


            /* =========================
               UPLOAD AUDIO
            ========================= */

            const {
                error:
                    audioUploadError
            } = await supabaseClient
                .storage
                .from("songs")
                .upload(
                    audioPath,
                    audioFile,
                    {
                        cacheControl:
                            "3600",

                        upsert:
                            false,

                        contentType:
                            audioFile.type
                    }
                );


            if (
                audioUploadError
            ) {

                console.error(
                    audioUploadError
                );

                showToast(
                    "Failed to upload audio."
                );

                return;
            }


            /* =========================
               UPLOAD COVER
            ========================= */

            let coverPath =
                null;


            if (
                coverInput &&
                coverInput.files.length
            ) {

                const coverFile =
                    coverInput.files[0];


                const coverExtension =
                    coverFile.name
                        .split(".")
                        .pop();


                coverPath =
                    `${user.id}/${crypto.randomUUID()}.${coverExtension}`;


                const {
                    error:
                        coverUploadError
                } = await supabaseClient
                    .storage
                    .from("covers")
                    .upload(
                        coverPath,
                        coverFile,
                        {
                            cacheControl:
                                "3600",

                            upsert:
                                false,

                            contentType:
                                coverFile.type
                        }
                    );


                if (
                    coverUploadError
                ) {

                    console.error(
                        coverUploadError
                    );

                    showToast(
                        "Failed to upload cover."
                    );

                    return;
                }
            }


            /* =========================
               CREATE SONG RECORD
            ========================= */

            const {
                data: songData,
                error: songError
            } = await supabaseClient
                .from("songs")
                .insert({

                    title:
                        title,

                    artist:
                        artist,

                    genre:
                        genre,

                    audio_url:
                        audioPath,

                    cover_url:
                        coverPath,

                    user_id:
                        user.id,

                    plays:
                        0,

                    likes:
                        0

                })
                .select()
                .single();


            if (songError) {

                console.error(
                    songError
                );

                showToast(
                    "Failed to publish song."
                );

                return;
            }


            songs.unshift(
                songData
            );


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
        document.getElementById(
            "profile"
        );


    if (!profile) return;


    profile.classList.remove(
        "hidden-section"
    );


    profile.scrollIntoView({
        behavior:
            "smooth"
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
                (
                    sum,
                    song
                ) =>
                    sum +
                    (
                        Number(
                            song.plays
                        ) || 0
                    ),
                0
            );


        plays.textContent =
            formatNumber(
                total
            );
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
                light
                    ? "☀"
                    : "☾";
        }
    );
}


function loadTheme() {

    const theme =
        localStorage.getItem(
            "aiMusicTheme"
        );


    if (
        theme ===
        "light"
    ) {

        document.body.classList.add(
            "light-mode"
        );


        if (themeButton) {

            themeButton.textContent =
                "☀";
        }
    }
}


/* =========================
   NAVIGATION
========================= */

function scrollToSection(id) {

    const element =
        document.getElementById(
            id
        );


    if (!element) return;


    element.scrollIntoView({
        behavior:
            "smooth"
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


    toast.classList.add(
        "show"
    );


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            2500
        );
}


/* =========================
   SECURITY HELPERS
========================= */

function escapeHTML(value) {

    return String(
        value ?? ""
    )
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );
}


function escapeAttribute(value) {

    return String(
        value ?? ""
    )
        .replaceAll(
            "\\",
            "\\\\"
        )
        .replaceAll(
            "'",
            "\\'"
        );
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
            event.target ===
            uploadModal
        ) {

            closeUploadModal();
        }


        if (
            event.target ===
            playlistModal
        ) {

            closePlaylistModal();
        }
    }
);


/* =========================
   AUTH STATE
========================= */

supabaseClient.auth.onAuthStateChange(
    async () => {

        await loadUserData();

        renderSongs();

        renderPlaylists();

        updateProfile();
    }
);


/* =========================
   INITIALIZE
========================= */

async function initializeApp() {

    loadTheme();

    await loadSongs();

    await loadUserData();

    renderSongs();

    renderPlaylists();

    updateProfile();
}


/* =========================
   START
========================= */

initializeApp();

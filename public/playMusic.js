window.addEventListener('DOMContentLoaded', () => {
    const music = document.getElementById('backgroundMusic');
    music.volume = 0.15;
    music.play().catch(() => {
        function playMusicOnInteraction() {
            music.play();
            window.removeEventListener('click', playMusicOnInteraction);
        }
        window.addEventListener('click', playMusicOnInteraction);
    });
});

import { useState, useEffect } from 'react';

const usePlayer = () => {
    const [currentSong, setCurrentSong] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [audio] = useState(new Audio());

    useEffect(() => {
        if (currentSong) {
            audio.src = currentSong.audioUrl;
            audio.load();
        }
    }, [currentSong, audio]);

    const play = () => {
        if (currentSong) {
            audio.play();
            setIsPlaying(true);
        }
    };

    const pause = () => {
        audio.pause();
        setIsPlaying(false);
    };

    const stop = () => {
        audio.pause();
        audio.currentTime = 0;
        setIsPlaying(false);
    };

    const setSong = (song) => {
        setCurrentSong(song);
        stop();
    };

    return {
        currentSong,
        isPlaying,
        play,
        pause,
        stop,
        setSong,
    };
};

export default usePlayer;
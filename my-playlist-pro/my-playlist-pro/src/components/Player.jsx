import React from 'react';

const Player = ({ currentSong, onPlay, onPause, isPlaying }) => {
    return (
        <div className="player">
            {currentSong ? (
                <div>
                    <h2>Now Playing: {currentSong.title} by {currentSong.artist}</h2>
                    <audio controls autoPlay={isPlaying} src={currentSong.audioUrl}>
                        Your browser does not support the audio element.
                    </audio>
                    <button onClick={onPause}>Pause</button>
                    <button onClick={onPlay}>Play</button>
                </div>
            ) : (
                <h2>Select a song to play</h2>
            )}
        </div>
    );
};

export default Player;
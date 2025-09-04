import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import SongManager from './pages/SongManager';
import PlaylistManager from './pages/PlaylistManager';
import './styles/App.css';

const App = () => {
    return (
        <Router>
            <div className="App">
                <Switch>
                    <Route path="/" exact component={Dashboard} />
                    <Route path="/songs" component={SongManager} />
                    <Route path="/playlists" component={PlaylistManager} />
                </Switch>
            </div>
        </Router>
    );
};

export default App;
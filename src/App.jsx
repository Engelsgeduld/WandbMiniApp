import React from "react"
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import Home from "./pages/Home.jsx";
import ProjectSelection from "./pages/ProjectSelection.jsx";
import Runs from "./pages/Runs.jsx";
import RunDetails from "./pages/RunDetails.jsx";
import {ApiKeyProvider} from "./ApiKeyContext";

function App() {
    return (
        <ApiKeyProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<Home/>}/>
                    <Route path="/projects" element={<ProjectSelection/>}/>
                    <Route path="/projects/:projectId" element={<Runs/>}/>
                    <Route path="/projects/:projectId/runs/:runId" element={<RunDetails/>}/>
                </Routes>
            </Router>
        </ApiKeyProvider>
    );
}

export default App;

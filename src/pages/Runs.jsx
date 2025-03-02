import React, {useEffect, useState} from "react";
import {useParams, useNavigate} from "react-router-dom";
import {useApiKey} from "../ApiKeyContext.jsx";
import {showTelegramPopup} from "../utils/telegramUtils.jsx";

const Runs = () => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const {projectId} = useParams();
    const {apiKey} = useApiKey()
    const [runs, setRuns] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredRuns, setFilteredRuns] = useState([]);
    const navigate = useNavigate();
    useEffect(() => {
        if (window.Telegram?.WebApp) {
            const tg = window.Telegram.WebApp;

            tg.BackButton.show();

            tg.BackButton.onClick(() => {
                navigate("/projects");
            });

            return () => {
                tg.BackButton.hide();
            };
        }
    }, [navigate]);
    useEffect(() => {
        fetch(`${backendUrl}/get_runs`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({api_key: apiKey, project_id: projectId}),
        })
            .then((response) => {
                if (!response.ok) {
                    showTelegramPopup("Ошибка", "Ошибка загрузки запусков")
                }
                return response.json();
            })
            .then((data) => {
                setRuns(data.runs_list);
                setFilteredRuns(data.runs_list);
            })
    }, [apiKey, projectId]);

    useEffect(() => {
        const results = runs.filter((run) =>
            run[1].toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredRuns(results);
    }, [searchQuery, runs]);

    return (
        <div className="w-full max-w-md mx-auto p-4 bg-gray-800 rounded-lg shadow-md">
            <h1 className="text-2xl font-semibold text-white text-center mb-6">Запуски</h1>

            <div className="search-container">
                <input
                    type="text"
                    placeholder="Поиск по названию"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                />
            </div>

            <div className="overflow-y-auto max-h-[250px] hide-scrollbar">
                {filteredRuns.length === 0 ? (
                    <p className="text-white text-center">Нет запусков, удовлетворяющих поисковому запросу.</p>
                ) : (
                    filteredRuns.map((run) => (
                        <div key={run[0]} className="card">
                            <div onClick={() => navigate(`runs/${run[0]}`)}>
                                <p className="text-white text-lg">Name: {run[1]}</p>
                                <p className="text-sm text-gray-400">Id: {run[0]}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Runs;

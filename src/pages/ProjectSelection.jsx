import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {useApiKey} from "../ApiKeyContext";
import {showTelegramPopup} from "../utils/telegramUtils.jsx";

const ProjectSelection = () => {
    const {apiKey} = useApiKey();
    const [projects, setProjects] = useState([]);
    const navigate = useNavigate();
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    useEffect(() => {
        if (window.Telegram?.WebApp) {
            const tg = window.Telegram.WebApp;
            tg.BackButton.show();
            tg.BackButton.onClick(() => {
                navigate("/");
            });
            return () => {
                tg.BackButton.hide();
            };
        }
    }, [navigate]);

    useEffect(() => {
        if (!apiKey) {
            showTelegramPopup("Ошибка", "Не выбран api ключ")
            return;
        }

        fetch(`${backendUrl}/get_projects`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({api_key: apiKey}),
        })
            .then((response) => {
                if (!response.ok) {
                    showTelegramPopup("Ошибка", "Ошибка загрузки проектов")
                }
                return response.json();
            })
            .then((data) => {
                setProjects(data.projects);
            })
    }, [apiKey]);


    return (
        <div className="w-full max-w-md mx-auto p-4 bg-gray-800 rounded-lg shadow-md">
            <h1 className="text-2xl font-semibold text-white text-center mb-6">
                Проекты
            </h1>
            <h2 className="text-lg font-medium text-white text-center mb-4">Сохраненные проекты</h2>
            <div className="overflow-y-auto max-h-[250px] hide-scrollbar">
                {projects.length === 0 ? (
                    <p className="text-white text-center">Нет сохраненных проектов</p>
                ) : (
                    projects.map((project) => (
                        <div
                            key={project[0]}
                            className="card"
                        >
                            <div onClick={() => navigate(`/projects/${project[1]}`)}>
                                <p className="text-white text-lg">Name: {project[1]}</p>
                                <p className="text-sm text-gray-400 truncate w-32">Id: {project[0]}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ProjectSelection;

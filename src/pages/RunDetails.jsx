import React, {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {Line} from "react-chartjs-2";
import {Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement} from "chart.js";
import {useApiKey} from "../ApiKeyContext.jsx";
import {showTelegramPopup} from "../utils/telegramUtils.jsx";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);

const RunDetails = () => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const {apiKey} = useApiKey();
    const {projectId, runId} = useParams();
    const [runData, setRunData] = useState(null);
    const [selectedMetrics, setSelectedMetrics] = useState([]);
    const [showCharts, setShowCharts] = useState(false);

    useEffect(() => {
        if (window.Telegram?.WebApp) {
            const tg = window.Telegram.WebApp;
            tg.BackButton.show();
            tg.BackButton.onClick(() => window.history.back());

            return () => {
                tg.BackButton.hide();
            };
        }
    }, []);

    useEffect(() => {
        fetch(`${backendUrl}/get_run_data`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({api_key: apiKey, project_id: projectId, run_id: runId}),
        })
            .then((response) => {
                if (!response.ok) {
                    showTelegramPopup("Ошибка", "Ошибка загрузки запусков")
                }
                return response.json();
            })
            .then((data) => {
                setRunData(data.run_data);
            })
    }, [apiKey, projectId, runId]);

    const toggleMetric = (key) => {
        setSelectedMetrics((prev) =>
            prev.includes(key) ? prev.filter((m) => m !== key) : [...prev, key]
        );
    };

    return (
        <div className="w-full max-w-md mx-auto p-4 bg-gray-900 text-white rounded-lg shadow-md">
            <h1 className="text-2xl font-semibold text-center mb-4">Детали запуска</h1>

            {runData ? (
                <div className="bg-gray-800 p-4 rounded-lg shadow-md">
                    <p className="text-lg font-semibold">📌 {runData.name}</p>
                    <p className="text-gray-400">🗓 Дата: {runData.date}</p>
                    <p className="text-gray-300">🔹 Статус: {runData.status}</p>
                </div>
            ) : (
                <p className="text-center text-gray-400">Загрузка...</p>
            )}

            <div className="bg-gray-800 p-4 rounded-lg shadow-md mt-4">
                <p className="text-lg font-semibold text-center mb-2">Выберите метрики</p>
                {runData?.metrics.map((metric) => (
                    <label key={metric.key} className="flex items-center mb-2">
                        <input
                            type="checkbox"
                            className="mr-2 w-4 h-4"
                            checked={selectedMetrics.includes(metric.key)}
                            onChange={() => toggleMetric(metric.key)}
                        />
                        <span className="text-white">{metric.title}</span>
                    </label>
                ))}
                <button
                    onClick={() => setShowCharts(true)}
                    className="w-full bg-teal-500 text-white text-lg font-semibold p-3 rounded-lg shadow-md mt-3"
                    disabled={selectedMetrics.length === 0}
                >
                    Показать графики
                </button>
            </div>

            {showCharts && (
                <div className="mt-6">
                    {runData?.metrics
                        .filter((metric) => selectedMetrics.includes(metric.key))
                        .map((metric, index) => (
                            <div key={index} className="bg-gray-800 p-4 rounded-lg shadow-md mt-3">
                                <p className="font-semibold text-center">{metric.title}</p>
                                <div className="chart-container">
                                    <Line
                                        data={{
                                            labels: metric.epochs,
                                            datasets: [
                                                {
                                                    label: metric.title,
                                                    data: metric.data,
                                                    borderColor: "red",
                                                    backgroundColor: `red`,
                                                    borderWidth: 2,
                                                    pointRadius: 3
                                                }
                                            ]
                                        }}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: true,
                                            plugins: {legend: {display: false}},
                                            scales: {
                                                x: {grid: {color: "#444"}, ticks: {color: "#ccc"}},
                                                y: {grid: {color: "#444"}, ticks: {color: "#ccc"}}
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                </div>
            )}
        </div>
    );
};

export default RunDetails;

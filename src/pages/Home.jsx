import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {useApiKey} from "../ApiKeyContext";
import {showTelegramPopup} from "../utils/telegramUtils.jsx";

const Home = () => {
    const {setApiKey} = useApiKey()
    const [telegramId, setTelegramId] = useState(null);
    const [apiKeys, setApiKeys] = useState([]);
    const [newApiKey, setNewApiKey] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    useEffect(() => {
        if (window.Telegram?.WebApp) {
            const tg = window.Telegram.WebApp;
            const user = tg.initDataUnsafe?.user;

            if (user && user.id) {
                setTelegramId(user.id);
                fetchUserApiKeys(user.id);
            } else {
                console.error("Не удалось получить Telegram ID пользователя.");
            }
        }
    }, []);

    const fetchUserApiKeys = async (userId) => {
        try {
            const response = await fetch(`${backendUrl}/get_keys?telegram_id=${userId}`);
            const data = await response.json();

            if (response.ok) {
                setApiKeys(data.keys || []);
            } else {
                showTelegramPopup("Ошибка", data.message)
            }
        } catch (error) {
            console.error(error)
            showTelegramPopup("Ошибка", "Ошибка соединения с сервером")
        }
    };

    const handleAddKey = async () => {
        if (!newApiKey.trim()) {
            showTelegramPopup("Ошибка", "API ключ не может быть пустым")
        } else {
            setLoading(true);
            try {
                const response = await fetch(`${backendUrl}/add_key`, {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({api_key: newApiKey, telegram_id: telegramId}),
                });

                const data = await response.json();

                if (response.ok) {
                    setApiKeys((prevKeys) => [
                        ...prevKeys,
                        {name: data.username, key: newApiKey}
                    ]);
                    setNewApiKey("");
                } else {
                    showTelegramPopup("Ошибка", data.message)
                }
            } catch (error) {
                console.error(error)
                showTelegramPopup("Ошибка", "Ошибка соединения с сервером")
            } finally {
                setLoading(false);
            }
        }
    };

    const handleDeleteKey = async (keyToDelete) => {
        try {
            const response = await fetch(`${backendUrl}/delete_key`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({api_key: keyToDelete, telegram_id: telegramId})
            });

            const data = await response.json();

            if (response.ok) {
                setApiKeys(apiKeys.filter((key) => key.key !== keyToDelete));
            } else {
                showTelegramPopup("Ошибка", data.message)
            }
        } catch (error) {
            console.error(error)
            showTelegramPopup("Ошибка", "Ошибка соединения с сервером")
        }
    };

    return (
        <div className="w-full max-w-md mx-auto p-4 bg-gray-800 rounded-lg shadow-md">

            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-white text-center mb-6">Добавить новый ключ</h1>
                <input
                    type="text"
                    value={newApiKey}
                    onChange={(e) => setNewApiKey(e.target.value)}
                    placeholder="Введите API ключ"
                    className="w-full p-3 mb-4 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <button
                    onClick={handleAddKey}
                    className="w-full bg-green-500 text-white text-lg font-semibold p-3 rounded-lg shadow-md mt-2"
                    disabled={loading}
                >
                    Подтвердить
                </button>
            </div>

            <h1 className="text-2xl font-semibold text-white text-center mb-6">
                Сохраненные API ключи
            </h1>

            <div className="w-full max-w-md overflow-auto mt-4 hide-scrollbar"
                 style={{
                     maxHeight: "250px",
                 }}>
                {apiKeys.length === 0 ? (
                    <p className="text-white text-center">Нет сохраненных ключей</p>
                ) : (
                    apiKeys.map((key, index) => (
                        <div
                            key={index}
                            className="card"
                        >
                            <div className="flex flex-col w-full" onClick={() => {
                                setApiKey(key.key);
                                navigate(`/projects`);
                            }}>
                                <span className="font-semibold text-white">Name: {key.name}</span>
                                <span className="text-sm text-gray-300 truncate">API Key: {key.key}</span>
                            </div>
                            <button
                                onClick={() => handleDeleteKey(key.key)}
                                className="bg-red-500 text-white p-2 rounded-lg delete-btn"
                            >
                                ✖
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Home;

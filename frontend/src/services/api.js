// 从环境变量读取 API 地址，支持以逗号分隔的多个地址
const getApiUrls = () => {
    const urls = import.meta.env.VITE_API_URLS || "";
    return urls.split(',').map(url => url.trim()).filter(url => url);
};

const API_URLS = getApiUrls();
let currentApiIndex = 0;

const getNextApiUrl = () => {
    if (API_URLS.length === 0) {
        throw new Error("No API URLs configured");
    }
    const url = API_URLS[currentApiIndex];
    // 简单的轮询策略 (Round-Robin)
    currentApiIndex = (currentApiIndex + 1) % API_URLS.length;
    console.log(`Using API node: ${url}`);
    return url;
};

export const generateImage = async (prompt, width, height, steps) => {
    const baseUrl = getNextApiUrl();
    const url = new URL(baseUrl);
    url.searchParams.append("prompt", prompt);
    url.searchParams.append("width", width);
    url.searchParams.append("height", height);
    url.searchParams.append("steps", steps);

    try {
        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: {
                'Accept': 'image/jpeg',
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API Error: ${response.status} - ${errorText}`);
        }

        const blob = await response.blob();
        return URL.createObjectURL(blob);
    } catch (error) {
        console.error("Failed to generate image:", error);
        throw error;
    }
};
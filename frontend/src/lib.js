export const apibaseurl = "https://gateway-hxuk.onrender.com/api";
export const imgurl = import.meta.env.BASE_URL;

export function callApi(reqMethod, apiUrl, jsonData, formData, responseHandler, jwtToken = "")
{
    let targetUrl = apiUrl;
    
    // Automatically point to local Spring Boot backend when testing locally
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
        targetUrl = apiUrl.replace("https://gateway-hxuk.onrender.com/api", "http://localhost:8001");
        // Translate auth requests from FastAPI Gateway paths to Spring Boot paths
        targetUrl = targetUrl.replace("/authservice", "/user");
    }

    const headers = {};
    if (jsonData) headers["Content-Type"] = "application/json";
    if (jwtToken) headers["Token"] = jwtToken;

    const options = {
        method: reqMethod, 
        headers: headers, 
        body: jsonData ? JSON.stringify(jsonData) : formData ? formData : undefined
    };

    fetch(targetUrl, options)
        .then((res) => res.json())
        .then((data) => responseHandler(data))
        .catch((err) => console.error("API Error: ", err));
}
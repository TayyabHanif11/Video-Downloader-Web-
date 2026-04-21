async function getInfo() {
    const url = document.getElementById("url").value;
    const resultDiv = document.getElementById("result");
    const statusDiv = document.getElementById("status");

    // 🔵 Reset status
    statusDiv.innerText = "";

    // 🔵 Loading message
    resultDiv.innerHTML = "<p>Loading video details...</p>";

    try {
        const res = await fetch("/info", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ url })
        });

        const data = await res.json();

        // 🔵 Show video info
        resultDiv.innerHTML = `
            <h2>${data.title}</h2>
            <img src="${data.thumbnail}" style="max-width:300px;" />
            <h3>Download Options:</h3>
        `;

        // 🔵 Create buttons
        data.formats.forEach(f => {
            const btn = document.createElement("button");
            btn.innerText = f.quality;

            btn.onclick = () => {

        statusDiv.innerText =
        "Preparing your download... (Don't close the tab)";

        const a = document.createElement("a");
        a.href = `/download?url=${encodeURIComponent(url)}&quality=${f.quality}`;
        a.click();
        };

            resultDiv.appendChild(btn);
        });

        

    } catch (err) {
        resultDiv.innerHTML = "<p>Error loading video</p>";
    }
}
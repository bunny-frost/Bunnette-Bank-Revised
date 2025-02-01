const express = require(`express`);
const fs = require(`fs`);
const path = require(`path`);

const app = express();
const PORT = 5500;

// Middleware for parsing JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "Bin")));

// Serve the main home.html file
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "home.html"));
});

// Endpoint to handle adding a new word
app.post("/add-word", (req, res) => {
    const { word, meaning, example, novel, chapter } = req.body;

    // Validate required fields
    if (!word || !meaning) {
        return res.status(400).json({ error: "Word and meaning are required!" });
    }

    // Create a new word object
    const new_word = {
        KeyLetter: word[0].toLowerCase(),
        Word: word,
        Meaning: meaning,
        Example: example || "",
        Novel: novel || "",
        Chapter: chapter || "",
    };

    // Path to the data.json file
    const file_path = path.join(__dirname, "Bin", "data.json");

    // Read and update the JSON file
    fs.readFile(file_path, "utf-8", (err, data) => {
        if (err) {
            console.error("Error reading data.json:", err);
            return res.status(500).json({ error: "Error reading data file." });
        }

        // Parse and update the JSON data
        const json_data = JSON.parse(data);
        const new_id = Object.keys(json_data).length + 1;
        json_data[new_id] = new_word;

        // Write the updated data back to the file
        fs.writeFile(file_path, JSON.stringify(json_data, null, 2), (err) => {
            if (err) {
                console.error("Error writing to data.json:", err);
                return res.status(500).json({ error: "Error saving word." });
            }

            res.json({ message: "Word added successfully!", word: new_word });
        });
    });
});

app.post("/edit-word", (req, res) => {
    const { id, word, meaning, example, novel, chapter } = req.body;

    // Validate required fields
    if (!id || !word || !meaning) {
        return res.status(400).json({ error: "ID, word, and meaning are required!" });
    }

    // Path to the data.json file
    const file_path = path.join(__dirname, "Bin", "data.json");

    // Read and update the JSON file
    fs.readFile(file_path, "utf-8", (err, data) => {
        if (err) {
            console.error("Error reading data.json:", err);
            return res.status(500).json({ error: "Error reading data file." });
        }

        // Parse the JSON data
        const json_data = JSON.parse(data);

        // Check if the word with the given ID exists
        if (!json_data[id]) {
            return res.status(404).json({ error: "Word not found!" });
        }

        // Update the word details
        json_data[id] = {
            KeyLetter: word[0].toLowerCase(),
            Word: word,
            Meaning: meaning,
            Example: example || json_data[id].Example,
            Novel: novel || json_data[id].Novel,
            Chapter: chapter || json_data[id].Chapter,
        };

        // Write the updated data back to the file
        fs.writeFile(file_path, JSON.stringify(json_data, null, 2), (err) => {
            if (err) {
                console.error("Error writing to data.json:", err);
                return res.status(500).json({ error: "Error saving changes." });
            }

            res.json({ message: "Word updated successfully!", word: json_data[id] });
        });
    });
});

app.post("/delete-word", (req, res) => {
    const { id } = req.body;

    // Validate required fields
    if (!id) {
        return res.status(400).json({ error: "ID is required!" });
    }

    // Path to the data.json file
    const file_path = path.join(__dirname, "Bin", "data.json");

    // Read and update the JSON file
    fs.readFile(file_path, "utf-8", (err, data) => {
        if (err) {
            console.error("Error reading data.json:", err);
            return res.status(500).json({ error: "Error reading data file." });
        }

        // Parse the JSON data
        const json_data = JSON.parse(data);

        // Check if the word with the given ID exists
        if (!json_data[id]) {
            return res.status(404).json({ error: "Word not found!" });
        };

        delete json_data[id];   

        // Write the updated data back to the file
        fs.writeFile(file_path, JSON.stringify(json_data, null, 2), (err) => {
            if (err) {
                console.error("Error writing to data.json:", err);
                return res.status(500).json({ error: "Error saving changes." });
            }

            res.json({ message: "Word deleted successfully!" });
        });
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

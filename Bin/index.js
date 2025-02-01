const add_word = document.querySelector(".container .right-pane .top-pane .add-word");
const close_buttons = document.querySelectorAll(".close");
const popup = document.querySelector(".container .new-word");
const epopup = document.querySelector(".container .edit-word");
const right_pane = document.querySelector(".right-pane");
const left_pane = document.querySelector(".left-pane")
const letters = document.querySelectorAll(".left-pane .letter");
const show_all = document.getElementById("show");

add_word.addEventListener("click", () => {
    popup.classList.remove("hidden");
});

close_buttons.forEach(close_button => {
    const parentElement = close_button.parentElement;
    const gparentElement = parentElement.parentElement;
    const ggParentElement = gparentElement.parentElement;
    close_button.addEventListener("click", () => {
        if (ggParentElement.classList[0] === 'new-word') {
            popup.classList.add("hidden");
        } else if (ggParentElement.classList[0] === 'edit-word') {
            epopup.classList.add("hidden");
        }
    });
})

document.addEventListener('DOMContentLoaded', () => {
    const wordsContainer = document.querySelector('.words-container');
    let wordBank = []; // To store all the word data
    let currentWords = []; // To store the currently displayed words
    let currentBatch = 0; // Tracks the current chunk of words
    const batchSize = 100; // Number of words to load at once
    let wordsLoaded = false; // Flag to indicate if words are loaded

    // Fetch the data from the JSON file
    fetch('./data.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            wordBank = Object.entries(data); // Store words from data.json
            currentWords = wordBank; // Initialize currentWords with the full word bank
            loadWords(); // Load the first batch of words
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });

    // Show all words
    show_all.addEventListener("click", () => {
        currentBatch = 0;
        wordsContainer.innerHTML = "";
        currentWords = wordBank; // Reset to show all words
        populateWords(currentWords);
    });

    // Search functionality
    document.getElementById("search-box").addEventListener("input", function (event) {
        const searchTerm = event.target.value.trim().toLowerCase();

        currentWords = wordBank.filter(([id, wordData]) =>
            wordData.Word.toLowerCase().includes(searchTerm)
        );

        // Reset batch loading for the search
        currentBatch = 0;
        wordsContainer.innerHTML = '';
        populateWords(currentWords);
    });

    // Lazy loading implementation
    right_pane.addEventListener("scroll", () => {
        const scrollPosition = right_pane.scrollTop + right_pane.clientHeight;
        const documentHeight = right_pane.scrollHeight;

        if (scrollPosition >= documentHeight - 100) {
            loadWords(); // Load the next batch of words
        }
    });

    // Load the next batch of words
    function loadWords() {
        const nextBatch = currentWords.slice(currentBatch * batchSize, (currentBatch + 1) * batchSize);

        if (nextBatch.length === 0) {
            return; // No more words to load
        }

        // Append the words to the container without resetting
        populateWords(nextBatch);

        currentBatch++;
    }

    // Function to update the UI with the given list of words
    function populateWords(words) {
        const windowWidth = window.innerWidth;
        let columns;
        let wordGrid;

        // Set number of columns based on window width
        if (currentBatch === 0) {
            wordsContainer.innerHTML = ''; // Clear existing words only on first batch
        }

        wordGrid = document.createElement('div');
        wordGrid.classList.add('word-grid');
        wordsContainer.appendChild(wordGrid);

        if (windowWidth > 1220) {
            columns = 5;
        } else if (windowWidth <= 720) {
            columns = 2;
            adjustLeftPane()
        } else {
            columns = 3
        }

        words.forEach(([id, wordData], index) => {
            const wordBox = document.createElement('div');
            wordBox.classList.add('word-box', `${id}`, `${wordData.KeyLetter.toLowerCase()}`);
            wordBox.innerHTML = `
                <div class="word">${wordData.Word} <div class="edit ${id}"><i class='bx bx-pencil ${id}'></i></div></div>
                <div class="meaning">${wordData.Meaning}<br><br>
                    <em>${wordData.Example}
                    </em>
                </div>
                <div class="word-foot">
                    <div class="group"><i class='bx bx-book-open margin-right'></i> ${wordData.Novel} <div class="group margin-left"><i class='bx bx-bookmark margin-right'></i> ${wordData.Chapter}</div></div>
                    <div class="group"><i class='bx bx-trash ${id} trash'></i></div>
                </div>
            `;

            wordGrid.appendChild(wordBox);

            // Create a new grid when the row is full
            if ((index + 1) % columns === 0 && index + 1 !== words.length) {
                wordGrid = document.createElement('div');
                wordGrid.classList.add('word-grid');
                wordsContainer.appendChild(wordGrid);
            }
        });

        // Mark as loaded when the last batch is displayed
        if (wordsContainer.children.length > 0 && words.length > 0) {
            wordsLoaded = true;
        }

        // Attach listeners to .word-box i elements once all words are loaded
        if (wordsLoaded) {
            attachEditListeners();
            attachDeleteListeners();
        }
    }

    // Adjust layout on window resize
    window.addEventListener('resize', () => {
        adjustLeftPane()
        populateWords(currentWords);
    });

    // Letter filter functionality
    letters.forEach(letter => {
        letter.addEventListener("click", () => {
            const keyLet = letter.classList[1].toLowerCase();

            currentWords = wordBank.filter(([id, wordData]) =>
                wordData.KeyLetter.toLowerCase() === keyLet
            );

            currentBatch = 0;
            wordsContainer.innerHTML = '';
            populateWords(currentWords);
        });
    });

    // Attach click listeners to .word-box .edit i elements
    function attachEditListeners() {
        const wordBoxes = document.querySelectorAll('.word-box');
    
        wordBoxes.forEach(wordBox => {
            const editIcon = wordBox.querySelector('.word .edit i'); // Select the <i> element inside .edit
            if (editIcon) {
                editIcon.addEventListener('click', () => {
                    epopup.classList.remove('hidden'); // Show the edit popup
    
                    const id = wordBox.classList[1]; // Assuming the ID is the second class on the word box
    
                    // Target the edit-word container
                    const editWordContainer = document.querySelector(".edit-word");
                    editWordContainer.setAttribute("data-id", id); // Store the ID in a data attribute
    
                    // Target the input fields within the edit-word form
                    const wordInput = editWordContainer.querySelector("#word");
                    const meaningInput = editWordContainer.querySelector("#meaning");
                    const exampleInput = editWordContainer.querySelector("#example");
                    const novelInput = editWordContainer.querySelector("#novel");
                    const chapterInput = editWordContainer.querySelector("#chapter");
    
                    // Populate the input fields with the current word data
                    const currentWordData = currentWords[id - 1][1];
                    wordInput.value = currentWordData.Word;
                    meaningInput.value = currentWordData.Meaning;
                    exampleInput.value = currentWordData.Example || "";
                    novelInput.value = currentWordData.Novel || "";
                    chapterInput.value = currentWordData.Chapter || "";
    
                    console.log(`Editing word ID: ${id}`);
                });
            } else {
                console.log(`Edit icon not found!`);
            }
        });
    }
    function attachDeleteListeners() {
        const wordBoxes = document.querySelectorAll('.word-box');
    
        wordBoxes.forEach(wordBox => {
            const deleteIcon = wordBox.querySelector('.word-foot .trash'); // Select the <i> element inside .edit
            if (deleteIcon) {
                deleteIcon.addEventListener('click', async () => { 
                    const id = deleteIcon.classList[2];
                    try {
                        const response = await fetch("/delete-word", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ id })
                        });
                
                        const result = await response.json();
                        if (response.ok) {
                            alert("Word removed successfully!");
                            location.reload();
                        } else {
                            alert(result.error || "An error occurred.");
                        }
                    } catch (error) {
                        console.error("Error removing word:", error);
                    }
                });
            } else {
                console.log(`Edit icon not found!`);
            }
        });
    }   
});

document.getElementById("add-word-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const addWordContainer = document.querySelector(".new-word");
    const word = addWordContainer.querySelector("#word").value;
    const meaning = addWordContainer.querySelector("#meaning").value;
    const example = addWordContainer.querySelector("#example").value;
    const novel = addWordContainer.querySelector("#novel").value;
    const chapter = addWordContainer.querySelector("#chapter").value;

    try {
        const response = await fetch("/add-word", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ word, meaning, example, novel, chapter })
        });

        const result = await response.json();
        if (response.ok) {
            alert("Word added successfully!");
            document.getElementById("add-word-form").reset();
            popup.classList.add("hidden");
            location.reload();
        } else {
            alert(result.error || "An error occurred.");
        }
    } catch (error) {
        console.error("Error adding word:", error);
    }
});

document.getElementById("edit-word-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const editWordContainer = document.querySelector(".edit-word");
    const word = editWordContainer.querySelector("#word").value;
    const meaning = editWordContainer.querySelector("#meaning").value;
    const example = editWordContainer.querySelector("#example").value;
    const novel = editWordContainer.querySelector("#novel").value;
    const chapter = editWordContainer.querySelector("#chapter").value;

    // Retrieve the ID (stored in a data attribute or globally)
    const id = editWordContainer.getAttribute("data-id");

    try {
        const response = await fetch("/edit-word", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, word, meaning, example, novel, chapter }),
        });

        const result = await response.json();
        if (response.ok) {
            alert("Word updated successfully!");
            document.getElementById("edit-word-form").reset();
            epopup.classList.add("hidden");
            location.reload(); // Reload to reflect changes
        } else {
            alert(result.error || "An error occurred.");
        }
    } catch (error) {
        console.error("Error editing word:", error);
    }
});

function adjustLeftPane() {
    const leftPane = document.querySelector('.left-pane');
    const letters = document.querySelectorAll('.left-pane .letter');
    const screenWidth = window.innerWidth;

    if (screenWidth <= 720) {
        // Apply dynamic styles for small screens
        leftPane.style.flexDirection = "row"
        leftPane.style.borderBottom = "1px solid #ccc"
        leftPane.style.overflowX = 'scroll';
        leftPane.style.overflowY = 'hidden';
        leftPane.style.height = '40px';
        leftPane.style.minWidth = '100%';
        show_all.style.minWidth = "50px"
        show_all.style.maxWidth = "70px"
        show_all.style.borderRight = "1px solid #ccc"

        letters.forEach(letter => {
            letter.style.minWidth = '50px'; // Fixed width
            letter.style.maxWidth = '50px'; // Fixed width
            letter.style.height = '100%'; // Match left-pane height
            letter.style.textAlign = 'center';
            letter.style.justifyContent = "center"
            letter.style.lineHeight = '40px'; // Vertically center text
            letter.style.borderRight = '1px solid #ccc'; // Add right border
        });

        // Remove the border-right from the last letter
        if (letters.length > 0) {
            letters[letters.length - 1].style.borderRight = 'none';
        }
    } else {
        // Revert to default styles for larger screens
        leftPane.style.display = '';
        leftPane.style.flexWrap = '';
        leftPane.style.overflowX = '';
        leftPane.style.overflowY = '';
        leftPane.style.height = '';
        leftPane.style.minWidth = '';

        letters.forEach(letter => {
            letter.style.flex = '';
            letter.style.height = '';
            letter.style.textAlign = '';
            letter.style.lineHeight = '';
            letter.style.borderRight = '';
        });
    }
}
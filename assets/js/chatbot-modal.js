
const launcher = document.getElementById("chat-toggle-btn");
const modal    = document.getElementById("chatbot-modal");
const closeBtn = document.getElementById("chatbot-close"); 


const chatbotHTML = `
<div class="chat-container">
    <header class="chat-header">
        <div class="bot-avatar">
            <img src="https://cdn-icons-png.flaticon.com/512/4712/4712109.png" alt="Dawson Bungalow Assistant">
        </div>
        <div class="header-info">
            <h1>Dawson Bungalow Assistant</h1>
            <p>Ask me about rooms, amenities, check&#8209;in, or local attractions.</p>
        </div>
    </header>

    <main class="chat-body" id="chat-body">
        <div class="message bot-message">
            <p>Hello 👋 Ask me anything about Kandy Dawson Bungalow. If I take too long to reply, please reload the page.</p>
        </div>
    </main>

    <footer class="chat-footer">
        <form id="chat-form" novalidate>
            <input
                type="text"
                id="user-input"
                placeholder="Ask about rooms, check-in…"
                autocomplete="off"
            >
            <button type="button" id="mic-btn" title="Speak">
                <svg viewBox="0 0 24 24" fill="none" width="24" height="24">
                    <path d="M12 1C10.3431 1 9 2.34315 9 4V12C9 13.6569 10.3431 15 12 15C13.6569 15 15 13.6569 15 12V4C15 2.34315 13.6569 1 12 1Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M19 10V12C19 15.3137 15.866 18 12 18C8.13401 18 5 15.3137 5 12V10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M12 18V23" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M8 23H16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </button>
            <button type="submit" id="send-btn" title="Send">
                <svg viewBox="0 0 24 24" fill="none" width="24" height="24">
                    <path d="M22 2L11 13M22 2L15 22L11 13M11 13L2 9L22 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </button>
        </form>
    </footer>
</div>`;


// ---------------------------------------------------------------------------
// Modal open / close
// ---------------------------------------------------------------------------

function openModal() {
    const content = modal.querySelector(".chatbot-modal-content");

    // Inject chat markup and initialise only on the very first open
    if (!content.querySelector(".chat-container")) {
        content.insertAdjacentHTML("beforeend", chatbotHTML);
        initChat();
    } else {
        // On reopen: clear input and scroll to latest message
        const userInput = document.getElementById("user-input");
        if (userInput) userInput.value = "";
        const chatBody = document.getElementById("chat-body");
        if (chatBody) chatBody.scrollTop = chatBody.scrollHeight;
    }

    modal.classList.add("show");
}

function closeModal() {
    modal.classList.remove("show");
    // DOM is kept intact so IDs / listeners aren't duplicated on reopen
}

// Wire up close button (it's in the static HTML, always available)
if (closeBtn) closeBtn.addEventListener("click", closeModal);

// Toggle on launcher click
launcher.addEventListener("click", (e) => {
    e.stopPropagation();
    modal.classList.contains("show") ? closeModal() : openModal();
});

// Close when clicking the dark overlay outside the chat window
modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
});

// Close on Escape key
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("show")) closeModal();
});


// ---------------------------------------------------------------------------
// Chat functionality
// ---------------------------------------------------------------------------

function initChat() {
    const API_URL    = "https://dawson-bungalow-api-latest.onrender.com";
    const chatForm   = document.getElementById("chat-form");
    const userInput  = document.getElementById("user-input");
    const chatBody   = document.getElementById("chat-body");
    const micButton  = document.getElementById("mic-btn");

    let isWaiting    = false;
    let chatHistory  = [];
    const MAX_HISTORY = 20; // keep last 20 messages to avoid large payloads

    // -- Typing indicator --
    const typingIndicator = document.createElement("div");
    typingIndicator.className = "typing-indicator";
    typingIndicator.innerHTML = `
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
    `;
    chatBody.appendChild(typingIndicator);
    // CSS default is display:none; JS shows it as flex when needed

    // -- Helpers --
    function appendMessage(text, sender) {
        const msgDiv = document.createElement("div");
        msgDiv.classList.add("message", sender === "user" ? "user-message" : "bot-message");
        msgDiv.textContent = text;
        chatBody.insertBefore(msgDiv, typingIndicator);
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    function showTyping() {
        typingIndicator.style.display = "flex";
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    function hideTyping() {
        typingIndicator.style.display = "none";
    }

    // -- API call --
    async function sendToAI(text) {
        showTyping();
        isWaiting = true;

        chatHistory.push({ role: "user", content: text });

        // Trim history to avoid ever-growing payloads
        if (chatHistory.length > MAX_HISTORY) {
            chatHistory = chatHistory.slice(-MAX_HISTORY);
        }

        try {
            const res = await fetch(`${API_URL}/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ question: text, history: chatHistory }),
            });

            if (!res.ok) throw new Error(`Server error: ${res.status}`);

            const data = await res.json();
            hideTyping();

            if (data.answer && data.answer.trim() !== "") {
                appendMessage(data.answer, "bot");
                chatHistory.push({ role: "assistant", content: data.answer });
            } else {
                appendMessage("Sorry, I couldn't generate a response.", "bot");
            }
        } catch (err) {
            console.error("Chat error:", err);
            hideTyping();
            appendMessage("Error connecting to the server. Please try again later.", "bot");
        }

        isWaiting = false;
    }

    // -- Form submit --
    chatForm.addEventListener("submit", (e) => {
        e.preventDefault();
        if (isWaiting) return;
        const text = userInput.value.trim();
        if (!text) return;
        appendMessage(text, "user");
        userInput.value = "";
        sendToAI(text);
    });

    // -- Speech-to-Text (mic button) --
    // Guard: SpeechRecognition is not available in Firefox or some mobile browsers
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SR) {
        const recognition = new SR();
        recognition.lang = "en-US";
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onresult = (event) => {
            const speechText = event.results[0][0].transcript;
            appendMessage(speechText, "user");
            sendToAI(speechText);
        };

        recognition.onerror = (event) => {
            console.error("Speech recognition error:", event.error);
        };

        micButton.addEventListener("click", () => {
            if (!isWaiting) recognition.start();
        });
    } else {
        // Hide mic button on browsers that don't support it
        micButton.style.display = "none";
    }
}
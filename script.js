const PHONE_NUMBER = "919262746293";

const contactForm = document.querySelector("#contact-form") || document.querySelector(".form-container form");

if (contactForm && !contactForm.dataset.whatsappBound) {
    contactForm.dataset.whatsappBound = "true";
    const status = contactForm.querySelector(".form-status");

    contactForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const nameInput = contactForm.querySelector('[name="name"]');
        const emailInput = contactForm.querySelector('[name="email"]');
        const messageInput = contactForm.querySelector('[name="message"]');

        const name = nameInput ? nameInput.value.trim() : "";
        const email = emailInput ? emailInput.value.trim() : "";
        const message = messageInput ? messageInput.value.trim() : "";

        const text = `Name: ${name}\nEmail: ${email}\nMessage: ${message}`;
        const encodedText = encodeURIComponent(text);
        const whatsappUrl = `https://api.whatsapp.com/send?phone=${PHONE_NUMBER}&text=${encodedText}`;

        // Open WhatsApp in a new tab
        window.open(whatsappUrl, "_blank");

        if (status) {
            status.textContent = "Opening WhatsApp...";
            status.classList.remove("is-error");
        }

        contactForm.reset();
    });
}

function bindVoiceInput() {
    const voiceButtons = document.querySelectorAll(".voice-toggle");
    if (!voiceButtons.length) return;

    const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) {
        voiceButtons.forEach((button) => {
            button.disabled = true;
            button.title = "Voice input is not supported in this browser.";
            button.textContent = "🎙️ Unavailable";
        });
        return;
    }

    voiceButtons.forEach((button) => {
        let recognition = null;
        const fieldShell = button.closest(".message-field-shell");
        const textarea = fieldShell ? fieldShell.querySelector("textarea") : null;

        if (!textarea) {
            return;
        }

        const setActiveState = (active) => {
            button.classList.toggle("is-active", active);
            button.setAttribute("aria-pressed", String(active));
            button.textContent = active ? "🛑 Stop" : "🎙️ Speak";
        };

        button.addEventListener("click", () => {
            if (button.classList.contains("is-active")) {
                recognition.stop();
                setActiveState(false);
                return;
            }

            recognition = new SpeechRecognitionCtor();
            recognition.lang = "en-US";
            recognition.interimResults = true;
            recognition.continuous = false;

            recognition.onresult = (event) => {
                const finalResult = Array.from(event.results)
                    .filter((result) => result.isFinal)
                    .map((result) => result[0].transcript)
                    .join(" ")
                    .trim();

                if (finalResult) {
                    const existing = textarea.value.trim();
                    textarea.value = existing ? `${existing} ${finalResult}` : finalResult;
                }
            };

            recognition.onerror = () => {
                setActiveState(false);
            };

            recognition.onend = () => {
                setActiveState(false);
            };

            setActiveState(true);
            recognition.start();
        });
    });
}

bindVoiceInput();
/* ============================================================
   DISCUSSION FORUM CONTROLLER (LocalStorage & Reactive Feed)
   ============================================================ */

const DEFAULT_DISCUSSIONS = [
    {
        id: "1",
        author: "Aisha Khan (Semester 6)",
        category: "stress",
        tag: "Exam stress",
        date: "2 hours ago",
        title: "Last-minute revision panic is worse than the actual exam",
        content: "I keep feeling my heart race before every paper. Even when I know the topic, the stress of finishing on time makes me blank out. I need a calmer routine before exams.",
        upvotes: 18,
        userVoted: false,
        replies: [
            { author: "Coach Desk", text: "Break revision into 25-minute blocks and take a 5-minute reset between topics to reduce panic spikes.", time: "1 hour ago" }
        ]
    },
    {
        id: "2",
        author: "Rohit Verma (B.Com Student)",
        category: "backlog",
        tag: "Backlogs",
        date: "Yesterday",
        title: "Backlog pressure keeps piling up before finals",
        content: "I have theory papers, practicals, and a backlog from earlier semesters all landing at once. It feels impossible to catch up without sacrificing sleep and focus.",
        upvotes: 27,
        userVoted: false,
        replies: [
            { author: "Study Buddy", text: "Start with the easiest high-weight subject first, then tackle backlog topics in small daily targets.", time: "18 hours ago" }
        ]
    },
    {
        id: "3",
        author: "Meera Joshi (Engineering Student)",
        category: "focus",
        tag: "Study focus",
        date: "3 days ago",
        title: "My attention drops after 45 minutes of study",
        content: "I can study for a while, but then my mind wanders and I end up checking my phone. I need better ways to stay focused during exam prep without burning out.",
        upvotes: 34,
        userVoted: true,
        replies: []
    }
];

const DISCUSSION_STORAGE_KEY = "exam_support_reviews";

// Initialize discussions in LocalStorage
function getDiscussions() {
    const saved = localStorage.getItem(DISCUSSION_STORAGE_KEY);
    if (!saved) {
        localStorage.setItem(DISCUSSION_STORAGE_KEY, JSON.stringify(DEFAULT_DISCUSSIONS));
        return DEFAULT_DISCUSSIONS;
    }

    try {
        const parsed = JSON.parse(saved);
        const hasLegacyMedicalTopics = Array.isArray(parsed) && parsed.some((discussion) => {
            const text = `${discussion.title || ""} ${discussion.content || ""}`.toLowerCase();
            return ["multimodal", "safety", "clinical", "ethics"].includes(discussion.category)
                || /crisis|clinical|therapy|therapist|mental health|counseling|anxiety|depression/i.test(text);
        });

        if (!Array.isArray(parsed) || hasLegacyMedicalTopics) {
            localStorage.setItem(DISCUSSION_STORAGE_KEY, JSON.stringify(DEFAULT_DISCUSSIONS));
            return DEFAULT_DISCUSSIONS;
        }

        return parsed;
    } catch (error) {
        localStorage.setItem(DISCUSSION_STORAGE_KEY, JSON.stringify(DEFAULT_DISCUSSIONS));
        return DEFAULT_DISCUSSIONS;
    }
}

function saveDiscussions(data) {
    localStorage.setItem(DISCUSSION_STORAGE_KEY, JSON.stringify(data));
}

let activeCategory = "all";
let searchQuery = "";

// Render discussions
function renderDiscussions() {
    const feed = document.getElementById("discussion-feed");
    if (!feed) return;

    let discussions = getDiscussions();

    // Filter by Category
    if (activeCategory !== "all") {
        discussions = discussions.filter(d => d.category === activeCategory);
    }

    // Filter by Search Query
    if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        discussions = discussions.filter(d =>
            d.title.toLowerCase().includes(q) ||
            d.content.toLowerCase().includes(q) ||
            d.author.toLowerCase().includes(q)
        );
    }

    if (discussions.length === 0) {
        feed.innerHTML = `
            <div class="discussion-empty">
                <strong>No discussions found</strong>
                <p>Try a different search or start a new conversation.</p>
            </div>
        `;
        return;
    }

    feed.innerHTML = discussions.map(post => {
        const initial = post.author ? post.author.charAt(0).toUpperCase() : "U";
        return `
            <div class="discussion-card" data-id="${post.id}">
                <div class="discussion-header">
                    <div class="author-meta">
                        <div class="author-avatar">${initial}</div>
                        <div class="author-info">
                            <div class="name">${post.author}</div>
                            <div class="date">${post.date}</div>
                        </div>
                    </div>
                    <span class="tag-badge">${post.tag}</span>
                </div>

                <h3>${post.title}</h3>
                <p>${post.content}</p>

                <div class="discussion-footer">
                    <button type="button" class="vote-btn ${post.userVoted ? 'voted' : ''}" onclick="toggleVote('${post.id}')">
                        ▲ Upvote (${post.upvotes})
                    </button>
                    <button type="button" class="reply-toggle-btn" onclick="toggleReplies('${post.id}')">
                        💬 Replies (${post.replies.length})
                    </button>
                </div>

                <!-- Replies Accordion -->
                <div class="replies-section" id="replies-${post.id}">
                    <div class="replies-list">
                        ${post.replies.map(r => `
                            <div class="reply-item">
                                <div class="reply-header">
                                    <strong>${r.author}</strong>
                                    <span>${r.time}</span>
                                </div>
                                <p>${r.text}</p>
                            </div>
                        `).join("")}
                    </div>

                    <div class="add-reply-box">
                        <input type="text" id="reply-input-${post.id}" placeholder="Write a response..." onkeydown="if(event.key === 'Enter') submitReply('${post.id}')">
                        <button type="button" onclick="submitReply('${post.id}')">Reply</button>
                    </div>
                </div>
            </div>
        `;
    }).join("");
}

// Toggle Upvote
window.toggleVote = function(id) {
    const list = getDiscussions();
    const item = list.find(d => d.id === id);
    if (item) {
        if (item.userVoted) {
            item.upvotes--;
            item.userVoted = false;
        } else {
            item.upvotes++;
            item.userVoted = true;
        }
        saveDiscussions(list);
        renderDiscussions();
    }
};

// Toggle Replies Accordion
window.toggleReplies = function(id) {
    const section = document.getElementById(`replies-${id}`);
    if (section) {
        section.classList.toggle("open");
    }
};

// Add Reply
window.submitReply = function(id) {
    const input = document.getElementById(`reply-input-${id}`);
    if (!input || !input.value.trim()) return;

    const list = getDiscussions();
    const post = list.find(d => d.id === id);
    if (post) {
        post.replies.push({
            author: "You (Contributor)",
            text: input.value.trim(),
            time: "Just now"
        });
        saveDiscussions(list);
        renderDiscussions();
        // Keep replies open
        setTimeout(() => {
            const sec = document.getElementById(`replies-${id}`);
            if (sec) sec.classList.add("open");
        }, 10);
    }
};

// DOM Event Listeners Setup
document.addEventListener("DOMContentLoaded", () => {
    // 1. Initial render
    renderDiscussions();

    // 2. Category tab switching
    const tabButtons = document.querySelectorAll(".d-tab");
    tabButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            tabButtons.forEach(b => {
                b.classList.remove("active");
                b.setAttribute("aria-pressed", "false");
            });
            btn.classList.add("active");
            btn.setAttribute("aria-pressed", "true");
            activeCategory = btn.getAttribute("data-category");
            renderDiscussions();
        });
    });

    // 3. Search query filter
    const searchInput = document.getElementById("discussion-search");
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            searchQuery = e.target.value;
            renderDiscussions();
        });
    }

    // 4. Modal Open & Close
    const modal = document.getElementById("discussion-modal");
    const openBtn = document.getElementById("open-discussion-modal");
    const closeBtn = document.getElementById("close-discussion-modal");
    const cancelBtn = document.getElementById("cancel-discussion-modal");
    const newForm = document.getElementById("new-discussion-form");

    if (openBtn && modal) {
        openBtn.addEventListener("click", () => {
            modal.classList.add("active");
            modal.setAttribute("aria-hidden", "false");
            document.getElementById("post-author").focus();
        });
    }
    const closeModal = () => {
        if (!modal) return;
        modal.classList.remove("active");
        modal.setAttribute("aria-hidden", "true");
        openBtn?.focus();
    };
    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    if (cancelBtn) cancelBtn.addEventListener("click", closeModal);
    if (modal) {
        modal.addEventListener("click", event => {
            if (event.target === modal) closeModal();
        });
        document.addEventListener("keydown", event => {
            if (event.key === "Escape" && modal.classList.contains("active")) closeModal();
        });
    }

    // 5. Submit New Discussion
    if (newForm) {
        newForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const author = document.getElementById("post-author").value.trim() || "Anonymous Contributor";
            const category = document.getElementById("post-category").value;
            const title = document.getElementById("post-title").value.trim();
            const content = document.getElementById("post-content").value.trim();

            const categoryLabels = {
                stress: "Exam stress",
                backlog: "Backlogs",
                focus: "Study focus",
                routine: "Daily routine"
            };

            const newPost = {
                id: Date.now().toString(),
                author,
                category,
                tag: categoryLabels[category] || "General",
                date: "Just now",
                title,
                content,
                upvotes: 1,
                userVoted: true,
                replies: []
            };

            const list = getDiscussions();
            list.unshift(newPost);
            saveDiscussions(list);

            newForm.reset();
            closeModal();
            renderDiscussions();
        });
    }
});

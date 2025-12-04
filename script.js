// ===========================
// GLOBAL
// ===========================
const API_BASE = "https://evote-live-elections.onrender.com";

const partyColors = {
    "BJP": { bg: "bg-orange-100", text: "text-orange-700" },
    "Congress": { bg: "bg-green-100", text: "text-green-700" },
    "AAP": { bg: "bg-blue-100", text: "text-blue-700" },
    "Independent": { bg: "bg-gray-200", text: "text-gray-700" },
    "Party A": { bg: "bg-purple-100", text: "text-purple-700" },
    "Party B": { bg: "bg-yellow-100", text: "text-yellow-700" }
};

// PNG LOGOS (REAL)
const partyLogos = {
    "BJP": "assets/party-logos/bjp.png",
    "Congress": "assets/party-logos/congress.png",
    "AAP": "assets/party-logos/aap.png",
    "Independent": "assets/party-logos/independent.png",
    "Party A": "assets/party-logos/partya.png",
    "Party B": "assets/party-logos/partyb.png"
};

let selectedCandidate = null;


// ===========================
// VERIFY VOTER
// ===========================
async function verifyVoter() {
    let aadhaar = document.getElementById("aadhaar").value;

    let response = await fetch(`${API_BASE}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aadhaar: Number(aadhaar) })
    });

    if (!response.ok) {
        alert("Voter not found or already voted!");
        return;
    }

    let voter = await response.json();
    localStorage.setItem("voter", JSON.stringify(voter));

    window.location.href = "vote.html";
}


// ===========================
// LOAD CANDIDATES UI
// ===========================
function loadCandidates() {
    fetch(`${API_BASE}/candidates`)
        .then(res => res.json())
        .then(data => {

            let box = document.getElementById("candidateList");
            box.innerHTML = "";

            data.forEach(c => {

                // Normalize Party Name
                let rawParty = c.party || "Independent";
                let partyName = rawParty.toLowerCase().trim();

                if (partyName.includes("aam") && partyName.includes("aadmi")) partyName = "AAP";
                else if (partyName.includes("bjp")) partyName = "BJP";
                else if (partyName.includes("cong")) partyName = "Congress";
                else if (partyName.includes("ind")) partyName = "Independent";
                else if (partyName.includes("party a")) partyName = "Party A";
                else if (partyName.includes("party b")) partyName = "Party B";
                else partyName = rawParty;

                let color = partyColors[partyName] || { bg: "bg-gray-200", text: "text-gray-700" };
                let logoSrc = partyLogos[partyName] || partyLogos["Independent"];

                let div = document.createElement("div");
                div.className =
                    "p-6 bg-white rounded-2xl shadow-xl hover:shadow-2xl cursor-pointer border hover:border-blue-500 transition";

                div.innerHTML = `
                    <div class="flex flex-col items-center space-y-4">

                        <img src="${logoSrc}" class="h-20 w-20 object-contain rounded-full shadow" />

                        <div class="text-2xl font-semibold text-gray-800">
                            ${c.name}
                        </div>

                        <div class="px-3 py-1 rounded-full ${color.bg} ${color.text}">
                            ${partyName}
                        </div>

                        <input type="radio" name="candidate"
                            value="${c.candidate_id}"
                            class="w-5 h-5 accent-blue-600 cursor-pointer" />
                    </div>
                `;

                div.addEventListener("click", () => {
                    let radio = div.querySelector("input");
                    radio.checked = true;
                    selectedCandidate = radio.value;
                });

                box.appendChild(div);
            });
        });
}


// ===========================
// CAST VOTE
// ===========================
async function castVote() {
    if (!selectedCandidate) return alert("Select a candidate!");

    let voter = JSON.parse(localStorage.getItem("voter"));

    let response = await fetch(`${API_BASE}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            voterId: voter.voter_id,
            candidateId: selectedCandidate
        })
    });

    let res = await response.json();
    alert(res.message);
    window.location.href = "result.html";
}


// ===========================
// LOAD RESULTS
// ===========================
if (window.location.pathname.includes("result.html")) {
    fetch(`${API_BASE}/results`)
        .then(res => res.json())
        .then(data => {

            let box = document.getElementById("resultBox");
            box.innerHTML = "";

            data.forEach(r => {

                // Detect party same way
                let rawParty = r.party || "Independent";
                let partyName = rawParty.toLowerCase().trim();

                if (partyName.includes("aam") && partyName.includes("aadmi")) partyName = "AAP";
                else if (partyName.includes("bjp")) partyName = "BJP";
                else if (partyName.includes("cong")) partyName = "Congress";
                else if (partyName.includes("ind")) partyName = "Independent";
                else partyName = rawParty;

                let color = partyColors[partyName] || { bg: "bg-gray-200", text: "text-gray-700" };
                let logo = partyLogos[partyName] || partyLogos["Independent"];

              let div = document.createElement("div");
div.className =
    "p-6 bg-white/10 backdrop-blur-xl text-white rounded-2xl shadow-xl hover:shadow-2xl transition border border-white/20";

div.innerHTML = `
    <div class="flex items-center justify-between">
        
        <img src="${logo}" class="h-16 w-16 object-contain rounded-full shadow" />

        <div class="text-2xl font-bold text-white">
            ${r.name}
        </div>

        <div class="px-3 py-1 rounded-full ${color.bg} ${color.text}">
            ${partyName}
        </div>

        <div class="text-xl font-extrabold text-yellow-300">
            ${r.total_votes} votes
        </div>

    </div>
`;



                box.appendChild(div);
            });
        });
}


// ===========================
// AUTO LOAD ON VOTE PAGE
// ===========================
if (window.location.pathname.includes("vote.html")) {
    loadCandidates();
}




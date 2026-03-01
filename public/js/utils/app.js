function showPage(page) {
    document.querySelectorAll(".content-page").forEach(p => p.classList.add("d-none"));
    document.getElementById(page).classList.remove("d-none");

    // Tabs active effect
    document.querySelectorAll(".tab-btn").forEach(btn => btn.classList.remove("active"));
    event.target.classList.add("active");
}
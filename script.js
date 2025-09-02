const config = {
    pageSize: 9,
    maxArticles: 60
};

let state = {
    page: 1,
    language: "en",
    source: "",
    category: "",
    searchQuery: "",
    loading: false,
    allLoaded: false,
    bookmarks: JSON.parse(localStorage.getItem("bookmarks") || "[]"),
    totalResults: 0
};

const elements = {
    newsContainer: $("#news-container"),
    loadMoreBtn: $("#loadMore"),
    endOfResults: $("#endOfResults"),
    noResults: $("#noResults"),
    apiError: $("#apiError"),
    bookmarksContainer: $("#bookmarks-container"),
    emptyBookmarks: $("#emptyBookmarks"),
    searchInput: $("#searchInput"),
    categoryFilter: $("#categoryFilter"),
    sourceFilter: $("#sourceFilter"),
    languageToggle: $("#languageToggle"),
    loading: $("#loading")
};

function showToast(message, type = "success") {
    const toastId = "toast-" + Date.now();
    const icon = type === "success" ? "fa-check-circle" :
        type === "error" ? "fa-exclamation-circle" : "fa-info-circle";

    const toastHtml = `
        <div id="${toastId}" class="toast align-items-center text-bg-${type} border-0 mb-2" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body">
                    <i class="fas ${icon} me-2"></i>${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        </div>`;

    $("#toastContainer").append(toastHtml);

    const toast = new bootstrap.Toast($(`#${toastId}`)[0], { delay: 3000 });
    toast.show();

    $(`#${toastId}`).on('hidden.bs.toast', function () {
        $(this).remove();
    });
}

function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function formatDate(dateString) {
    if (!dateString) return 'Date not available';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
        return `${diffMins} min ago`;
    } else if (diffHours < 24) {
        return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else {
        return date.toLocaleDateString();
    }
}

function fetchNews() {
    if (state.loading || state.allLoaded) return;

    state.loading = true;
    elements.endOfResults.addClass("d-none");
    elements.noResults.addClass("d-none");
    elements.apiError.addClass("d-none");

    elements.loading.removeClass("d-none");

    elements.newsContainer.addClass("d-none");

    elements.loadMoreBtn.addClass("d-none");

    fetchRealNews();
}

function fetchRealNews() {
    let endpoint = 'top-headlines';
    let params = {
        page: state.page,
        pageSize: config.pageSize,
        language: state.language
    };

    if (state.searchQuery) {
        endpoint = 'everything';
        params.q = state.searchQuery;
        params.sortBy = 'publishedAt';
        delete params.country;
        delete params.category;
    } else {
        if (state.category) {
            params.category = state.category;
        }

        if (state.source) {
            params.sources = state.source;
            delete params.country;
        } else {
            params.country = state.language === 'id' ? 'id' : 'us';
        }
    }

    Object.keys(params).forEach(key => {
        if (params[key] === "" || params[key] === null || params[key] === undefined) {
            delete params[key];
        }
    });

    params.endpoint = endpoint;

    $.ajax({
        url: 'proxy.php',
        method: 'GET',
        data: params,
        dataType: 'json',
        success: function (data) {
            if (data.status === 'ok') {
                displayNews(data.articles, data.totalResults);
            } else {
                showError('Failed to fetch news: ' + (data.message || 'Unknown error'));
            }
        },
        error: function (xhr, status, error) {
            showError('Network error: ' + error);
        },
        complete: function () {
            state.loading = false;
            elements.loading.addClass("d-none");
        }
    });
}

function displayNews(articles, totalResults = 0) {
    if (state.page === 1) {
        elements.newsContainer.empty();
        state.totalResults = totalResults;
    }

    elements.newsContainer.removeClass("d-none");

    if (!articles || articles.length === 0) {
        if (state.page === 1) {
            elements.noResults.removeClass("d-none");
            elements.newsContainer.addClass("d-none");
            elements.loadMoreBtn.addClass("d-none");
        } else {
            state.allLoaded = true;
            elements.endOfResults.removeClass("d-none");
            elements.loadMoreBtn.addClass("d-none");
        }
        return;
    }

    elements.noResults.addClass("d-none");
    elements.newsContainer.removeClass("d-none");
    elements.apiError.addClass("d-none");

    articles.forEach(article => {
        const isBookmarked = state.bookmarks.some(b => b.url === article.url);
        const card = createArticleCard(article, isBookmarked);
        elements.newsContainer.append(card);
    });

    handleImages();

    state.page++;

    if (articles.length < config.pageSize ||
        (state.totalResults > 0 && elements.newsContainer.children().length >= state.totalResults)) {
        state.allLoaded = true;
        elements.endOfResults.removeClass("d-none");
        elements.loadMoreBtn.addClass("d-none");
    } else {
        elements.endOfResults.addClass("d-none");
        elements.loadMoreBtn.removeClass("d-none");
    }
}

function showError(message) {
    elements.loading.addClass("d-none");

    elements.apiError.removeClass("d-none");
    elements.loadMoreBtn.addClass("d-none");
    console.error(message);
    showToast(message, "error");
}

function createArticleCard(article, isBookmarked = false) {
    const escapedTitle = escapeHtml(article.title || 'No title available');
    const escapedDescription = escapeHtml(article.description || 'No description available');
    const escapedAuthor = escapeHtml(article.author || 'Unknown author');
    const formattedDate = formatDate(article.publishedAt);
    const sourceName = article.source?.name || 'Unknown source';

    let imageHtml = '<div class="no-image"><i class="fas fa-image fa-2x"></i></div>';
    if (article.urlToImage) {
        imageHtml = `
            <div class="image-container">
                <div class="image-placeholder">
                    <i class="fas fa-spinner fa-spin"></i>
                </div>
                <img data-src="${article.urlToImage}" 
                     class="card-img-top news-image" 
                     alt="${escapedTitle}">
            </div>`;
    }

    return `
        <div class="col-md-6 col-lg-4">
            <div class="card h-100">
                ${imageHtml}
                <span class="source-badge badge bg-primary">${escapeHtml(sourceName)}</span>
                <div class="card-body">
                    <h5 class="card-title">${escapedTitle}</h5>
                    <p class="card-text">${escapedDescription}</p>
                    <div class="card-actions">
                        <div class="card-text-info">
                            <small class="text-muted d-block">${formattedDate}</small>
                            <small class="text-muted">By ${escapedAuthor}</small>
                        </div>
                        <div class="card-buttons">
                            <button class="btn btn-sm ${isBookmarked ? 'btn-primary' : 'btn-outline-primary'} bookmark-btn" 
                                    data-url="${article.url}" 
                                    data-title="${escapedTitle}"
                                    data-description="${escapedDescription}"
                                    data-image="${article.urlToImage || ''}"
                                    data-author="${escapedAuthor}"
                                    data-published="${article.publishedAt}"
                                    data-source="${sourceName}">
                                <i class="fas fa-bookmark"></i>
                            </button>
                            <a href="${article.url}" target="_blank" class="btn btn-sm btn-outline-secondary">
                                <i class="fas fa-external-link-alt"></i>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
}

function handleImages() {
    $('.news-image').each(function () {
        const img = $(this);
        const src = img.data('src');

        if (src) {
            img.attr('src', src);
        }
    });
}

function updateClearButtonState() {
    const clearButton = $("#clearBookmarks");
    if (state.bookmarks.length === 0) {
        clearButton.prop("disabled", true);
        // clearButton.removeClass("btn-danger").addClass("btn-secondary");
    } else {
        clearButton.prop("disabled", false);
        // clearButton.removeClass("btn-secondary").addClass("btn-danger");
    }

    clearButton.hide().show(0);
}

function renderBookmarks() {
    elements.bookmarksContainer.empty();

    if (state.bookmarks.length === 0) {
        elements.emptyBookmarks.removeClass("d-none");
        elements.bookmarksContainer.addClass("d-none");
        updateClearButtonState();
        return;
    }

    elements.emptyBookmarks.addClass("d-none");
    elements.bookmarksContainer.removeClass("d-none");

    state.bookmarks.forEach(article => {
        const escapedTitle = escapeHtml(article.title || 'No title available');
        const escapedAuthor = escapeHtml(article.author || 'Unknown author');
        const formattedDate = formatDate(article.publishedAt);

        let imageHtml = '<div class="no-image"><i class="fas fa-image fa-2x"></i></div>';
        if (article.urlToImage) {
            imageHtml = `
                <div class="image-container">
                    <div class="image-placeholder">
                        <i class="fas fa-spinner fa-spin"></i>
                    </div>
                    <img src="${article.urlToImage}" 
                         class="card-img-top news-image" 
                         alt="${escapedTitle}"
                         onload="this.style.opacity=1; this.previousElementSibling.style.display='none'"
                         onerror="this.style.display='none'; this.previousElementSibling.innerHTML='<i class=\'fas fa-exclamation-triangle\'></i> Image not available'; this.previousElementSibling.style.background='linear-gradient(135deg, #dc3545 0%, #a71e2a 100%)'">
                </div>`;
        }

        const card = `
            <div class="col-md-6 col-lg-4 mb-3">
                <div class="card h-100">
                    ${imageHtml}
                    <div class="card-body">
                        <h5 class="card-title">${escapedTitle}</h5>
                        <div class="card-actions">
                            <div class="card-text-info">
                                <small class="text-muted d-block">${formattedDate}</small>
                                <small class="text-muted">By ${escapedAuthor}</small>
                            </div>
                            <div class="card-buttons">
                                <a href="${article.url}" target="_blank" class="btn btn-sm btn-outline-secondary">
                                    <i class="fas fa-external-link-alt"></i>
                                </a>
                                <button class="btn btn-sm btn-outline-danger remove-bookmark" data-url="${article.url}">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;

        elements.bookmarksContainer.append(card);
    });

    updateClearButtonState();
    $('.modal-scrollable').scrollTop(0);
}

function addBookmark(article) {
    if (!state.bookmarks.find(a => a.url === article.url)) {
        state.bookmarks.push(article);
        localStorage.setItem("bookmarks", JSON.stringify(state.bookmarks));
        showToast("Article bookmarked successfully", "success");

        updateClearButtonState();
        return true;
    } else {
        showToast("Article already bookmarked", "warning");
        return false;
    }
}

function removeBookmark(url) {
    state.bookmarks = state.bookmarks.filter(a => a.url !== url);
    localStorage.setItem("bookmarks", JSON.stringify(state.bookmarks));
    showToast("Bookmark removed", "error");

    updateClearButtonState();

    if ($("#bookmarksModal").hasClass("show")) {
        renderBookmarks();
    }

    $(`.bookmark-btn[data-url="${url}"]`)
        .removeClass("btn-primary")
        .addClass("btn-outline-primary");
}

function resetSearch() {
    state.page = 1;
    state.allLoaded = false;
    elements.newsContainer.empty();
    elements.endOfResults.addClass("d-none");
    elements.noResults.addClass("d-none");
    elements.apiError.addClass("d-none");
    elements.loadMoreBtn.removeClass("d-none");
    elements.loading.addClass("d-none");
}

$(document).ready(function () {
    updateClearButtonState();
    fetchNews();

    elements.loadMoreBtn.click(function () {
        fetchNews();
    });

    $(document).on("click", ".bookmark-btn", function () {
        const article = {
            url: $(this).data("url"),
            title: $(this).data("title"),
            description: $(this).data("description"),
            urlToImage: $(this).data("image"),
            author: $(this).data("author"),
            publishedAt: $(this).data("published"),
            source: {
                name: $(this).data("source")
            }
        };

        const success = addBookmark(article);

        if (success) {
            $(this).removeClass("btn-outline-primary").addClass("btn-primary");
        }
    });

    $("#viewBookmarks").click(function () {
        renderBookmarks();
        $("#bookmarksModal").modal("show");
    });

    $(document).on("click", ".remove-bookmark", function () {
        const url = $(this).data("url");
        removeBookmark(url);
    });

    $("#clearBookmarks").click(function () {
        if ($(this).prop("disabled")) return;

        if (confirm("Are you sure you want to clear all bookmarks?")) {
            state.bookmarks = [];
            localStorage.removeItem("bookmarks");
            renderBookmarks();
            showToast("All bookmarks cleared", "error");

            $(".bookmark-btn")
                .removeClass("btn-primary")
                .addClass("btn-outline-primary");

            updateClearButtonState();
        }
    });

    $("#categoryFilter").change(function () {
        state.category = $(this).val();
        resetSearch();
        fetchNews();
    });

    $(".category-btn").click(function () {
        state.category = $(this).data("category");
        $("#categoryFilter").val(state.category);
        resetSearch();
        fetchNews();
    });

    $("#sourceFilter").change(function () {
        state.source = $(this).val();
        resetSearch();
        fetchNews();
    });

    $("#languageToggle").change(function () {
        state.language = $(this).val();
        resetSearch();
        fetchNews();
    });

    $("#searchBtn").click(function () {
        state.searchQuery = elements.searchInput.val();
        resetSearch();
        fetchNews();
    });

    elements.searchInput.keypress(function (e) {
        if (e.which === 13) {
            state.searchQuery = elements.searchInput.val();
            resetSearch();
            fetchNews();
        }
    });

    const initializeDarkMode = () => {
        const isDarkMode = localStorage.getItem("darkMode") === "true";
        if (isDarkMode) {
            $("body").addClass("dark-mode");
            $("#darkModeToggle").html('<i class="fas fa-sun"></i>');
        } else {
            $("#darkModeToggle").html('<i class="fas fa-moon"></i>');
        }
    };

    $("#darkModeToggle").click(function () {
        $("body").toggleClass("dark-mode");
        const isDarkMode = $("body").hasClass("dark-mode");

        if (isDarkMode) {
            $(this).html('<i class="fas fa-sun"></i>');
            localStorage.setItem("darkMode", "true");
        } else {
            $(this).html('<i class="fas fa-moon"></i>');
            localStorage.setItem("darkMode", "false");
        }
    });

    initializeDarkMode();

    $("#retryLoading").click(function () {
        resetSearch();
        fetchNews();
    });
});
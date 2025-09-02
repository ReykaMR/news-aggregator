<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>News Aggregator</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet"
        integrity="sha384-sRIl4kxILFvY47J16cr9ZwB07vP4J8+LH7qKQnuqkuIAvNWLzeN8tE5YBujZqJLB" crossorigin="anonymous">
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"
        integrity="sha256-/JqT3SQfawRcv/BIHPThkBvs0OEvtFFmqPF/lYI/Cxo=" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"
        integrity="sha384-FKyoEForCGlyvwx9Hj09JcYn3nv7wiPVlz7YYwJrWVcXK/BmnVDxM+D2scQbITxI"
        crossorigin="anonymous"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/7.0.0/css/all.min.css"
        integrity="sha512-DxV+EoADOkOygM4IR9yXP8Sb2qwgidEmeqAEmDKIOfPRQZOWbXCzLC6vjbZyy0vPisbH2SyW27+ddLVCN+OMzQ=="
        crossorigin="anonymous" referrerpolicy="no-referrer" />
    <link rel="stylesheet" href="style.css">
</head>

<body>
    <nav class="navbar navbar-expand-lg navbar-light sticky-top">
        <div class="container">
            <a class="navbar-brand logo" href="#">
                <i class="fas fa-newspaper me-2"></i>NewsHub
            </a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse my-3 my-lg-0" id="navbarContent">
                <div class="d-flex flex-column flex-lg-row gap-3 ms-lg-auto header-controls">
                    <select id="categoryFilter" class="form-select form-select-sm">
                        <option value="">All Categories</option>
                        <option value="business">Business</option>
                        <option value="entertainment">Entertainment</option>
                        <option value="general">General</option>
                        <option value="health">Health</option>
                        <option value="science">Science</option>
                        <option value="sports">Sports</option>
                        <option value="technology">Technology</option>
                    </select>

                    <select id="sourceFilter" class="form-select form-select-sm">
                        <option value="">All Sources</option>
                        <option value="bbc-news">BBC News</option>
                        <option value="cnn">CNN</option>
                        <option value="techcrunch">TechCrunch</option>
                        <option value="the-verge">The Verge</option>
                        <option value="reuters">Reuters</option>
                        <option value="associated-press">Associated Press</option>
                    </select>

                    <select id="languageToggle" class="form-select form-select-sm">
                        <option value="en">English</option>
                        <option value="id">Indonesia</option>
                    </select>

                    <div class="d-flex gap-2">
                        <button id="darkModeToggle" class="btn btn-sm btn-outline-secondary">
                            <i class="fas fa-moon"></i> Dark Mode
                        </button>
                        <button id="viewBookmarks" class="btn btn-sm btn-primary">
                            <i class="fas fa-bookmark"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </nav>

    <div class="container my-4">
        <div class="search-container">
            <div class="input-group">
                <input type="text" id="searchInput" class="form-control" placeholder="Search for news...">
                <button id="searchBtn" class="btn btn-primary">
                    <i class="fas fa-search"></i>
                </button>
            </div>
        </div>

        <div class="category-filter">
            <div class="d-flex flex-wrap justify-content-center">
                <button class="btn btn-sm btn-outline-primary category-btn" data-category="business">Business</button>
                <button class="btn btn-sm btn-outline-primary category-btn"
                    data-category="technology">Technology</button>
                <button class="btn btn-sm btn-outline-primary category-btn" data-category="sports">Sports</button>
                <button class="btn btn-sm btn-outline-primary category-btn" data-category="health">Health</button>
                <button class="btn btn-sm btn-outline-primary category-btn" data-category="science">Science</button>
                <button class="btn btn-sm btn-outline-primary category-btn"
                    data-category="entertainment">Entertainment</button>
            </div>
        </div>

        <div id="news-container" class="row g-4"></div>

        <div id="loading" class="text-center py-5 d-none">
            <div class="spinner-border text-primary mb-3" style="width: 3rem; height: 3rem;" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <h4>Loading News</h4>
            <p>Please wait while we fetch the latest news for you...</p>
        </div>

        <div class="load-more-container">
            <button id="loadMore" class="btn btn-primary">
                <i class="fas fa-plus-circle me-2"></i>Load More News
            </button>
        </div>

        <div id="endOfResults" class="d-none text-center py-4">
            <i class="fas fa-check-circle fa-2x mb-3 text-success"></i>
            <p>You've reached the end of the available news articles.</p>
        </div>

        <div id="noResults" class="text-center py-5 d-none">
            <i class="fas fa-search fa-3x mb-3 text-muted"></i>
            <h4>No articles found</h4>
            <p class="text-muted">Try adjusting your search or filters</p>
        </div>

        <div id="apiError" class="error-message d-none text-center py-5">
            <i class="fas fa-exclamation-triangle fa-3x mb-3 text-warning"></i>
            <h4>API Connection Issue</h4>
            <p>We're having trouble connecting to the news service. Please check your internet connection or try again
                later.</p>
            <button id="retryLoading" class="btn btn-primary mt-3">
                <i class="fas fa-redo me-2"></i>Try Again
            </button>
        </div>
    </div>

    <footer class="mt-5 py-3">
        <div class="container text-center">
            <p class="mb-1">© 2025 Reyka Mochammad Raihan.</p>
            <p class="mb-1">Version: 1.0.0</p>
            <p class="mb-2">Powered by <a href="https://newsapi.org/" target="_blank"
                    class="footer-link">NewsAPI.org</a></p>

            <div class="social-links">
                <a href="https://www.linkedin.com/in/reyka-mochammad-raihan" target="_blank" class="mx-2 social-link">
                    <i class="fab fa-linkedin fa-lg"></i>
                </a>
                <a href="https://github.com/ReykaMR" target="_blank" class="mx-2 social-link">
                    <i class="fab fa-github fa-lg"></i>
                </a>
                <a href="https://www.instagram.com/reyka_mr" target="_blank" class="mx-2 social-link">
                    <i class="fab fa-instagram fa-lg"></i>
                </a>
                <a href="https://www.facebook.com/reykamr" target="_blank" class="mx-2 social-link">
                    <i class="fab fa-facebook fa-lg"></i>
                </a>
            </div>
        </div>
    </footer>

    <div class="modal fade" id="bookmarksModal" tabindex="-1">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title"><i class="fas fa-bookmark me-2"></i>My Bookmarks</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div id="bookmarks-container" class="row g-3 modal-scrollable"></div>
                    <div id="emptyBookmarks" class="text-center py-5 d-none">
                        <i class="fas fa-bookmark fa-3x mb-3 text-muted"></i>
                        <h4>No bookmarks yet</h4>
                        <p class="text-muted">Start saving articles by clicking the bookmark icon!</p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button id="clearBookmarks" class="btn btn-danger" disabled>
                        <i class="fas fa-trash me-2"></i>Clear All
                    </button>
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                </div>
            </div>
        </div>
    </div>

    <div class="toast-container" id="toastContainer"></div>

    <script src="script.js"></script>
</body>

</html>
window.addEventListener('scroll', () => {
    const nav = document.querySelector('.navbar');
    const scrollPos = window.scrollY;

    if (scrollPos > 45) {
        // Quando passas a Top Bar, a Navbar cola no topo (0px)
        nav.classList.add('navbar-fixed');
    } else {
        // Quando estás no topo, volta ao normal
        nav.classList.remove('navbar-fixed');
    }
});



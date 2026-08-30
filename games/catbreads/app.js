const $ = (el) => document.getElementById(el);

function hideAllPages() {
    document.body.querySelectorAll('.page').forEach(page => page.classList.add('hidden'));
}
let currentPage = "home";
function gotoPage(page = "home") {
    document.getElementById('navTouchSidebar').classList.remove('show');

    hideAllPages();
    let navToPage = page;
    try {
        if (page.includes('/games/catbreads/')) {
            navToPage = page.replace("/games/catbreads/", "");
        }
        if (navToPage.includes('/')) {
            navToPage = page.replace("/", "");
        }
        if (navToPage.includes("index.html")) {
            navToPage = "home";
        }
        $(`page_${navToPage}`).classList.remove('hidden');

        history.pushState(null, "", `/games/catbreads/${navToPage}`);
        currentPage = navToPage;

        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });

        if (navToPage !== "home") {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    } catch(e) {
        //window.location.href = "/404.html";
        console.error(`[Debug] Cannot nav to page ${navToPage}:`, e);
    }
}
window.addEventListener('popstate', (e) => {
    gotoPage(window.location.pathname);
});
document.querySelectorAll('a[data-link]').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const route = link.getAttribute('href');
    gotoPage(route);
  });
});

//gotoPage('home');



window.addEventListener('scroll', () => {
  const navbar = document.getElementById('navbar');
  
  if (currentPage === "home") {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
  } else {
    navbar.classList.add('scrolled');
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const sections = document.querySelectorAll('.reveal');

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); 
      }
    });
  }, {
    threshold: 0.25
  });

  sections.forEach(section => observer.observe(section));
});
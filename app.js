const $ = (el) => document.getElementById(el);

function hideAllPages() {
    document.body.querySelectorAll('.page').forEach(page => page.classList.add('hidden'));
}

function pathToPage(input) {
    let p = input.replace(/^\/+|\/+$/g, '');
    if (p === '' || p === 'index.html') return 'home';
    return p;
}

let currentPage = "home";
function gotoPage(page = "home") {
    document.getElementById('navTouchSidebar').classList.remove('show');

    hideAllPages();
    const navToPage = pathToPage(page);

    try {
        if (navToPage.includes("gamescatbreads")) {
            window.location.href = "/games/catbreads/index.html";
            return;
        }

        const target = $(`page_${navToPage}`);
        if (!target) {
            throw new Error(`No section found for "${navToPage}"`);
        }
        target.classList.remove('hidden');

        history.pushState(null, "", `/${navToPage === 'home' ? '' : navToPage}`);
        currentPage = navToPage;

        window.scrollTo({ top: 0, behavior: 'smooth' });

        const navbar = document.getElementById('navbar');
        if (navToPage !== "home") {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    } catch (e) {
        console.error(`[Debug] Cannot nav to page ${navToPage}:`, e);
        hideAllPages();
        $('page_home')?.classList.remove('hidden');
        currentPage = 'home';
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

document.addEventListener('DOMContentLoaded', () => {
  gotoPage(window.location.pathname);
});


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
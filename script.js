// Récupère les éléments nécessaires au suivi de la section visible.
const navLinks = [...document.querySelectorAll('nav a')];
const sections = [...document.querySelectorAll('main section[id]')];
const progressBar = document.querySelector('.scroll-progress span');
let ticking = false;

// Met à jour à la fois le lien de navigation actif et la barre de progression.
// L'exécution est regroupée dans requestAnimationFrame pour éviter de recalculer
// l'état de la page à chaque événement « scroll » brut.
const updatePageState = () => {
  const position = window.scrollY + 180;
  let active = sections[0]?.id;

  sections.forEach((section) => {
    if (section.offsetTop <= position) active = section.id;
  });

  navLinks.forEach((link) => {
    const current = link.getAttribute('href') === `#${active}`;
    if (current) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });

  if (progressBar) {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0;
    progressBar.style.transform = `scaleY(${progress})`;
  }

  ticking = false;
};

const requestPageUpdate = () => {
  if (!ticking) {
    window.requestAnimationFrame(updatePageState);
    ticking = true;
  }
};

// Initialise l'état dès le chargement, puis le recalcule pendant le défilement
// et lors d'un changement de taille de la fenêtre.
updatePageState();
window.addEventListener('scroll', requestPageUpdate, { passive: true });
window.addEventListener('resize', requestPageUpdate);

const lightbox = document.querySelector('.lightbox');
const lightboxImage = lightbox?.querySelector('img');
const lightboxCaption = lightbox?.querySelector('p');
const lightboxClose = lightbox?.querySelector('.lightbox-close');
const projectImages = [...document.querySelectorAll('.project-gallery img, .featured-shot img')];

// Ouvre l'image sélectionnée dans la boîte de dialogue native <dialog>.
// La légende est récupérée depuis le <figcaption> associé à l'image.
const openLightbox = (image) => {
  if (!lightbox || !lightboxImage || !lightboxCaption) return;
  lightboxImage.src = image.src;
  lightboxImage.alt = image.alt;
  lightboxCaption.textContent = image.closest('figure')?.querySelector('figcaption')?.textContent || image.alt;
  document.body.classList.add('lightbox-open');
  lightbox.showModal();
  lightboxClose?.focus();
};

projectImages.forEach((image) => {
  // Rend les images utilisables au clavier, comme un bouton.
  image.tabIndex = 0;
  image.setAttribute('role', 'button');
  image.setAttribute('aria-label', `${image.alt} — ouvrir en grand`);
  image.addEventListener('click', () => openLightbox(image));
  image.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openLightbox(image);
    }
  });
});

const closeLightbox = () => lightbox?.close();
// La lightbox peut être fermée par le bouton, par un clic sur son arrière-plan,
// ou par la touche Échap gérée nativement par <dialog>.
lightboxClose?.addEventListener('click', closeLightbox);
lightbox?.addEventListener('click', (event) => {
  if (event.target === lightbox) closeLightbox();
});
lightbox?.addEventListener('close', () => {
  // Nettoie l'état visuel et la source de l'image après fermeture.
  document.body.classList.remove('lightbox-open');
  if (lightboxImage) lightboxImage.src = '';
});

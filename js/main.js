/* 
=========================================
PREMIUM LUXURY PORTFOLIO MAIN SCRIPTS
=========================================
*/

document.addEventListener('DOMContentLoaded', () => {
  initPreloader();
  initThemeToggle();
  initRTLToggle();
  initCustomCursor();
  initNavbarScroll();
  initMobileMenu();
  initBeforeAfterSlider();
  initVirtualTour();
  initFormValidation();
  initPortfolioFilters();
  initAnimations();
  initScrollToTop();

  // Refresh ScrollTrigger on window load to handle dynamic layout shifts (images, WebGL canvas, etc.)
  window.addEventListener('load', () => {
    setTimeout(() => {
      if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.refresh();
      }
    }, 900); // Wait for preloader to fade out (800ms) and DOM to settle
  });
});

// =========================================
// 1. Preloader Dismissal
// =========================================
function initPreloader() {
  const preloader = document.querySelector('.preloader');
  if (preloader) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        preloader.classList.add('loaded');
        document.body.style.overflow = 'visible';
      }, 800);
    });
  }
}

// =========================================
// 2. Dark/Light Theme Switcher
// =========================================
function initThemeToggle() {
  const themeToggle = document.getElementById('theme-toggle');
  if (!themeToggle) return;

  const currentTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', currentTheme);
  updateThemeIcon(currentTheme);

  themeToggle.addEventListener('click', () => {
    const activeTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = activeTheme === 'dark' ? 'light' : 'dark';
    
    // Smooth transition fade overlay
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.backgroundColor = newTheme === 'dark' ? '#080808' : '#faf9f6';
    overlay.style.opacity = '0';
    overlay.style.zIndex = '99999';
    overlay.style.pointerEvents = 'none';
    overlay.style.transition = 'opacity 0.4s ease';
    document.body.appendChild(overlay);

    setTimeout(() => overlay.style.opacity = '0.5', 10);

    setTimeout(() => {
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      updateThemeIcon(newTheme);
      // Trigger event for canvas-3d if active
      window.dispatchEvent(new CustomEvent('themeChanged', { detail: newTheme }));
    }, 200);

    setTimeout(() => {
      overlay.style.opacity = '0';
      setTimeout(() => overlay.remove(), 400);
    }, 450);
  });
}

function updateThemeIcon(theme) {
  const themeIcon = document.querySelector('#theme-toggle i');
  if (!themeIcon) return;
  if (theme === 'light') {
    themeIcon.className = 'bi bi-moon';
  } else {
    themeIcon.className = 'bi bi-sun';
  }
}

// =========================================
// 3. RTL / LTR Switcher
// =========================================
function initRTLToggle() {
  const rtlToggle = document.getElementById('rtl-toggle');
  if (!rtlToggle) return;

  const initialDir = localStorage.getItem('dir') || 'ltr';
  document.documentElement.setAttribute('dir', initialDir);
  updateRtlButtonText(initialDir);

  rtlToggle.addEventListener('click', () => {
    const currentDir = document.documentElement.getAttribute('dir') || 'ltr';
    const newDir = currentDir === 'ltr' ? 'rtl' : 'ltr';
    
    document.documentElement.setAttribute('dir', newDir);
    localStorage.setItem('dir', newDir);
    updateRtlButtonText(newDir);
    
    // Refresh GSAP scroll triggers since page flow changes
    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.refresh();
    }
  });
}

function updateRtlButtonText(dir) {
  const btn = document.getElementById('rtl-toggle');
  if (btn) {
    btn.innerHTML = dir === 'rtl' ? 'LTR' : 'RTL';
  }
}

// =========================================
// 4. Custom Magnetic Cursor
// =========================================
function initCustomCursor() {
  const cursor = document.querySelector('.custom-cursor');
  const follower = document.querySelector('.custom-cursor-follower');
  
  if (!cursor || !follower) return;

  let mouseX = 0, mouseY = 0;
  let followerX = 0, followerY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    cursor.style.left = mouseX + 'px';
    cursor.style.top = mouseY + 'px';
  });

  // Follower smooth interpolation (lerp)
  function updateFollower() {
    followerX += (mouseX - followerX) * 0.15;
    followerY += (mouseY - followerY) * 0.15;
    
    follower.style.left = followerX + 'px';
    follower.style.top = followerY + 'px';
    
    requestAnimationFrame(updateFollower);
  }
  updateFollower();

  // Hover states
  const interactiveElements = document.querySelectorAll('a, button, .portfolio-item, .pricing-card-premium, .service-card-premium, .ba-handle');
  interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.classList.add('custom-cursor-hover');
      follower.classList.add('custom-cursor-follower-hover');
    });
    
    el.addEventListener('mouseleave', () => {
      cursor.classList.remove('custom-cursor-hover');
      follower.classList.remove('custom-cursor-follower-hover');
    });
  });
}

// =========================================
// 5. Navbar Sticky scroll effect
// =========================================
function initNavbarScroll() {
  const nav = document.querySelector('.navbar-premium');
  if (!nav) return;
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  });
}

// =========================================
// 6. Mobile offcanvas menu
// =========================================
function initMobileMenu() {
  const toggler = document.querySelector('.navbar-toggler-premium');
  const menu = document.querySelector('.offcanvas-premium');
  const links = document.querySelectorAll('.offcanvas-nav-link');
  
  if (!toggler || !menu) return;
  
  function toggleMenu() {
    toggler.classList.toggle('open');
    menu.classList.toggle('show');
    if (menu.classList.contains('show')) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'visible';
    }
  }
  
  toggler.addEventListener('click', toggleMenu);
  
  links.forEach(link => {
    link.addEventListener('click', () => {
      if (menu.classList.contains('show')) {
        toggleMenu();
      }
    });
  });
}

// =========================================
// 7. Interactive Before/After Slider
// =========================================
function initBeforeAfterSlider() {
  const container = document.querySelector('.before-after-container');
  if (!container) return;
  
  const after = container.querySelector('.ba-after');
  const handle = container.querySelector('.ba-handle');
  
  if (!after || !handle) return;
  
  let isActive = false;
  
  function slide(x) {
    const rect = container.getBoundingClientRect();
    let position = ((x - rect.left) / rect.width) * 100;
    
    // Bounds clamping
    if (position < 0) position = 0;
    if (position > 100) position = 100;
    
    // Update widths and visual positions
    after.style.width = position + '%';
    handle.style.left = position + '%';
  }
  
  // Mouse Events
  container.addEventListener('mousedown', (e) => {
    isActive = true;
    slide(e.clientX);
  });
  
  window.addEventListener('mouseup', () => {
    isActive = false;
  });
  
  window.addEventListener('mousemove', (e) => {
    if (!isActive) return;
    slide(e.clientX);
  });
  
  // Touch Events (Mobile friendly)
  container.addEventListener('touchstart', (e) => {
    isActive = true;
    slide(e.touches[0].clientX);
  });
  
  window.addEventListener('touchend', () => {
    isActive = false;
  });
  
  window.addEventListener('touchmove', (e) => {
    if (!isActive) return;
    slide(e.touches[0].clientX);
  });
}

// =========================================
// 8. 360 Virtual Tour Simulation
// =========================================
function initVirtualTour() {
  const container = document.getElementById('tour-container');
  if (!container) return;
  
  const canvas = document.getElementById('tour-canvas');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  
  // Virtual Room Assets
  const rooms = {
    living: {
      imgUrl: 'assets/virtual-living.jpg',
      fallBackGradient: ['#121212', '#2a241b'],
      hotspots: [
        { x: 30, y: 55, label: 'Go to Pool Deck', target: 'pool' },
        { x: 75, y: 50, label: 'Go to Bedroom', target: 'bedroom' }
      ]
    },
    bedroom: {
      imgUrl: 'assets/virtual-bedroom.jpg',
      fallBackGradient: ['#1c1c1c', '#2c2225'],
      hotspots: [
        { x: 15, y: 55, label: 'Go to Living Room', target: 'living' }
      ]
    },
    pool: {
      imgUrl: 'assets/virtual-pool.jpg',
      fallBackGradient: ['#0d1117', '#1a2230'],
      hotspots: [
        { x: 80, y: 60, label: 'Go to Living Room', target: 'living' }
      ]
    }
  };
  
  let currentRoom = 'living';
  let img = new Image();
  let imgLoaded = false;
  
  let viewX = 0; // Horizontal scroll position
  let isDragging = false;
  let startX = 0;
  let momentumX = 0;
  
  function resizeCanvas() {
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    drawTour();
  }
  
  function loadRoom(roomKey) {
    currentRoom = roomKey;
    imgLoaded = false;
    
    // Clear dynamic hotspots from DOM inside tour container
    const oldHotspots = container.querySelectorAll('.tour-hotspot');
    oldHotspots.forEach(el => el.remove());
    
    img = new Image();
    img.src = rooms[roomKey].imgUrl;
    img.onload = () => {
      imgLoaded = true;
      drawTour();
      createHotspots();
    };
    img.onerror = () => {
      // Draw premium gradient fallback if image is not loaded
      imgLoaded = false;
      drawTour();
      createHotspots();
    };
  }
  
  function drawTour() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (imgLoaded) {
      // Render wide horizontal panoramic looping image
      const scale = canvas.height / img.height;
      const drawWidth = img.width * scale;
      
      // Infinite horizontal looping logic
      let x = viewX % drawWidth;
      if (x > 0) x -= drawWidth;
      
      ctx.drawImage(img, x, 0, drawWidth, canvas.height);
      if (x + drawWidth < canvas.width) {
        ctx.drawImage(img, x + drawWidth, 0, drawWidth, canvas.height);
      }
    } else {
      // Premium SVG-like placeholder drawn dynamically on Canvas
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      const gradColors = rooms[currentRoom].fallBackGradient;
      gradient.addColorStop(0, gradColors[0]);
      gradient.addColorStop(1, gradColors[1]);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Architectural abstract lines
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.1)';
      ctx.lineWidth = 2;
      for (let i = 0; i < canvas.width; i += 100) {
        ctx.beginPath();
        ctx.moveTo(i + viewX % 200, 0);
        ctx.lineTo(i + viewX % 200 - 150, canvas.height);
        ctx.stroke();
      }
      
      // HUD styling text
      ctx.fillStyle = 'rgba(212, 175, 55, 0.8)';
      ctx.font = '300 24px Outfit';
      ctx.fillText(currentRoom.toUpperCase() + ' - 360 PANORAMA VIEW', 50, 60);
      ctx.font = '300 14px Outfit';
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.fillText('DRAG LEFT OR RIGHT TO PAN ROOM', 50, 90);
    }
    
    // Update live hotspots absolute coordinates in DOM
    positionHotspots();
  }
  
  function createHotspots() {
    const roomInfo = rooms[currentRoom];
    roomInfo.hotspots.forEach(hs => {
      const el = document.createElement('div');
      el.className = 'tour-hotspot';
      el.dataset.target = hs.target;
      el.dataset.px = hs.x; // Original percent coordinate relative to panoramic width
      el.dataset.py = hs.y;
      
      const tooltip = document.createElement('span');
      tooltip.className = 'tour-hotspot-tooltip';
      tooltip.innerText = hs.label;
      el.appendChild(tooltip);
      
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        loadRoom(hs.target);
      });
      
      container.appendChild(el);
    });
    positionHotspots();
  }
  
  function positionHotspots() {
    const spots = container.querySelectorAll('.tour-hotspot');
    const width = canvas.width;
    const height = canvas.height;
    
    spots.forEach(spot => {
      const px = parseFloat(spot.dataset.px) / 100;
      const py = parseFloat(spot.dataset.py) / 100;
      
      // Calculate hotspot visual horizontal position relative to image panning (viewX)
      // Standardize pan range to percentage of visible width
      let xOffset = viewX;
      let visualX = ((px * width) + xOffset) % width;
      if (visualX < 0) visualX += width;
      
      spot.style.left = visualX + 'px';
      spot.style.top = (py * height) + 'px';
    });
  }
  
  // Event handlers for dragging panorama
  function startDrag(clientX) {
    isDragging = true;
    startX = clientX - viewX;
    momentumX = 0;
  }
  
  function doDrag(clientX) {
    if (!isDragging) return;
    const oldX = viewX;
    viewX = clientX - startX;
    momentumX = viewX - oldX;
    drawTour();
  }
  
  function endDrag() {
    isDragging = false;
    applyMomentum();
  }
  
  function applyMomentum() {
    if (Math.abs(momentumX) > 0.5 && !isDragging) {
      viewX += momentumX;
      momentumX *= 0.92; // Friction
      drawTour();
      requestAnimationFrame(applyMomentum);
    }
  }
  
  // Listeners
  container.addEventListener('mousedown', (e) => startDrag(e.clientX));
  window.addEventListener('mousemove', (e) => doDrag(e.clientX));
  window.addEventListener('mouseup', endDrag);
  
  container.addEventListener('touchstart', (e) => startDrag(e.touches[0].clientX));
  window.addEventListener('touchmove', (e) => doDrag(e.touches[0].clientX));
  window.addEventListener('touchend', endDrag);
  
  window.addEventListener('resize', resizeCanvas);
  
  // Room navigation clicks from buttons
  const buttons = document.querySelectorAll('.tour-control-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      buttons.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      const roomTarget = e.target.dataset.room;
      loadRoom(roomTarget);
    });
  });
  
  // Initial loading
  loadRoom('living');
  setTimeout(resizeCanvas, 300);
}

// =========================================
// 9. Contact / Booking Form Validation
// =========================================
function initFormValidation() {
  const form = document.getElementById('booking-form');
  if (!form) return;
  
  const inputs = form.querySelectorAll('.form-control-premium');
  
  inputs.forEach(input => {
    input.addEventListener('blur', () => {
      validateField(input);
    });
    input.addEventListener('input', () => {
      if (input.classList.contains('is-invalid')) {
        validateField(input);
      }
    });
  });
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let isValid = true;
    
    inputs.forEach(input => {
      if (!validateField(input)) {
        isValid = false;
      }
    });
    
    if (isValid) {
      showToastNotification();
      form.reset();
      // Reset animations of floating labels
      inputs.forEach(input => input.dispatchEvent(new Event('input')));
    }
  });
}

function validateField(field) {
  let valid = true;
  const val = field.value.trim();
  
  if (field.required && val === '') {
    valid = false;
  } else if (field.type === 'email' && val !== '') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    valid = emailRegex.test(val);
  } else if (field.id === 'phone' && val !== '') {
    const phoneRegex = /^[0-9+\-\s()]{7,15}$/;
    valid = phoneRegex.test(val);
  }
  
  if (valid) {
    field.classList.remove('is-invalid');
  } else {
    field.classList.add('is-invalid');
  }
  
  return valid;
}

function showToastNotification() {
  // Create beautiful, luxury floating notification
  const toast = document.createElement('div');
  toast.style.position = 'fixed';
  toast.style.bottom = '2rem';
  toast.style.right = '2rem';
  toast.style.backgroundColor = 'var(--card-bg)';
  toast.style.border = '1px solid var(--accent-color)';
  toast.style.color = 'var(--text-color)';
  toast.style.padding = '1.25rem 2rem';
  toast.style.zIndex = '999999';
  toast.style.fontFamily = 'var(--font-primary)';
  toast.style.fontSize = '0.9rem';
  toast.style.letterSpacing = '0.05em';
  toast.style.textTransform = 'uppercase';
  toast.style.boxShadow = '0 10px 30px rgba(0,0,0,0.5)';
  toast.style.transform = 'translateY(100px)';
  toast.style.opacity = '0';
  toast.style.transition = 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
  
  // RTL adjustments
  if (document.documentElement.getAttribute('dir') === 'rtl') {
    toast.style.right = 'auto';
    toast.style.left = '2rem';
  }
  
  toast.innerHTML = `
    <div style="display:flex; align-items:center; gap:1rem;">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-color)" stroke-width="2">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
      <span>Booking Request Received. I'll get back to you within 24 hours.</span>
    </div>
  `;
  
  document.body.appendChild(toast);
  
  // Slide up
  setTimeout(() => {
    toast.style.transform = 'translateY(0)';
    toast.style.opacity = '1';
  }, 100);
  
  // Dismiss after 4s
  setTimeout(() => {
    toast.style.transform = 'translateY(50px)';
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 500);
  }, 4000);
}

// =========================================
// 10. GSAP & ScrollTrigger Animations
// =========================================
function initAnimations() {
  // Check if GSAP is available in scope
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    // Elegant standard reveal transitions if GSAP fails to load
    const revealEls = document.querySelectorAll('.service-card-premium, .portfolio-item, .pricing-card-premium, .timeline-item');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, { threshold: 0.15 });
    
    revealEls.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
      el.style.transition = 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
      observer.observe(el);
    });
    return;
  }
  
  // Register ScrollTrigger
  gsap.registerPlugin(ScrollTrigger);
  
  // Animate Section Titles
  gsap.utils.toArray('.section-title-wrapper').forEach(title => {
    gsap.from(title, {
      opacity: 0,
      y: 50,
      duration: 1.2,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: title,
        start: 'top 85%',
        toggleActions: 'play none none none'
      }
    });
  });
  
  // Animate Service Cards (Staggered)
  gsap.from('.service-card-premium', {
    opacity: 0,
    y: 60,
    stagger: 0.2,
    duration: 1,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.services-grid-trigger',
      start: 'top bottom',
      toggleActions: 'play none none none'
    }
  });

  // Animate Portfolio items
  gsap.from('.portfolio-item', {
    opacity: 0,
    scale: 0.95,
    y: 40,
    stagger: 0.15,
    duration: 1,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.portfolio-grid-trigger',
      start: 'top 80%',
      toggleActions: 'play none none none'
    }
  });
  
  // Animate Timeline Items
  gsap.utils.toArray('.timeline-item').forEach((item, index) => {
    const xVal = index % 2 === 0 ? -60 : 60;
    // For RTL check
    const isRtl = document.documentElement.getAttribute('dir') === 'rtl';
    const xCalculated = isRtl ? -xVal : xVal;
    
    gsap.from(item, {
      opacity: 0,
      x: window.innerWidth > 768 ? xCalculated : 30,
      y: window.innerWidth <= 768 ? 40 : 0,
      duration: 1.2,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: item,
        start: 'top 85%',
        toggleActions: 'play none none none'
      }
    });
  });

  // Timeline Center Line Drawing animation
  gsap.from('.timeline-line', {
    scaleY: 0,
    transformOrigin: 'top center',
    duration: 2,
    ease: 'none',
    scrollTrigger: {
      trigger: '.timeline-wrapper',
      start: 'top 70%',
      end: 'bottom 80%',
      scrub: true
    }
  });

  // Pricing Cards
  gsap.from('.pricing-card-premium', {
    opacity: 0,
    y: 50,
    stagger: 0.2,
    duration: 1.2,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.pricing-grid-trigger',
      start: 'top 80%'
    }
  });
}

// =========================================
// 11. Portfolio Category Filtering
// =========================================
function initPortfolioFilters() {
  const filterBtns = document.querySelectorAll('.portfolio-filter-btn');
  const items = document.querySelectorAll('.portfolio-item-wrapper');
  
  if (!filterBtns.length || !items.length) return;
  
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const filter = btn.dataset.filter;
      
      items.forEach(item => {
        if (filter === 'all' || item.dataset.category === filter) {
          item.style.display = 'block';
          if (typeof gsap !== 'undefined') {
            gsap.fromTo(item, 
              { opacity: 0, y: 15 }, 
              { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
            );
          } else {
            item.style.opacity = '1';
          }
        } else {
          item.style.display = 'none';
        }
      });
      
      if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.refresh();
      }
    });
  });
}

// =========================================
// 12. Scroll to Top Button
// =========================================
function initScrollToTop() {
  const btn = document.createElement('button');
  btn.className = 'scroll-top-btn';
  btn.innerHTML = '<i class="bi bi-chevron-up"></i>';
  btn.setAttribute('aria-label', 'Scroll to top');
  document.body.appendChild(btn);

  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      btn.classList.add('show');
    } else {
      btn.classList.remove('show');
    }
  });

  btn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

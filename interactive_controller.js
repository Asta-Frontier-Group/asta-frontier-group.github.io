const application = Stimulus.Application.start();

application.register("interactive", class extends Stimulus.Controller {
  static targets = ["nav", "navLinks", "navToggle", "parallax", "reveal", "splitText", "marquee", "counter"]

  connect() {
    this.scrollY = 0;
    this.ticking = false;
    this.countersAnimated = false;

    this.onScroll = this.onScroll.bind(this);
    this.onResize = this.onResize.bind(this);

    window.addEventListener("scroll", this.onScroll, { passive: true });
    window.addEventListener("resize", this.onResize, { passive: true });

    this.initSplitText();
    this.initRevealObserver();
    this.initCounterObserver();

    requestAnimationFrame(() => this.onScroll());
  }

  disconnect() {
    window.removeEventListener("scroll", this.onScroll);
    window.removeEventListener("resize", this.onResize);
    if (this.revealObserver) this.revealObserver.disconnect();
    if (this.counterObserver) this.counterObserver.disconnect();
  }

  onScroll() {
    this.scrollY = window.scrollY;
    if (!this.ticking) {
      requestAnimationFrame(() => {
        this.updateNav();
        this.updateParallax();
        this.ticking = false;
      });
      this.ticking = true;
    }
  }

  onResize() {
    this.updateParallax();
  }

  updateNav() {
    if (this.hasNavTarget) {
      this.navTarget.classList.toggle("scrolled", this.scrollY > 60);
    }
  }

  updateParallax() {
    this.parallaxTargets.forEach(el => {
      const speed = parseFloat(el.dataset.speed) || 0.2;
      const rect = el.getBoundingClientRect();
      const centerOffset = rect.top + rect.height / 2 - window.innerHeight / 2;
      const y = centerOffset * speed * -1;
      el.style.transform = `translateY(${y}px)`;
    });
  }

  initSplitText() {
    if (!this.hasSplitTextTarget) return;

    const el = this.splitTextTarget;
    const html = el.innerHTML;

    const lines = html.split("<br>");
    const processed = lines.map(line => {
      const words = line.trim().split(/\s+/);
      return words.map(word =>
        `<span class="word"><span class="word-inner">${word}</span></span>`
      ).join(" ");
    }).join("<br>");

    el.innerHTML = processed;

    const wordInners = el.querySelectorAll(".word-inner");
    wordInners.forEach((word, i) => {
      setTimeout(() => {
        word.classList.add("visible");
      }, 200 + i * 80);
    });
  }

  initRevealObserver() {
    this.revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          this.revealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: "0px 0px -60px 0px"
    });

    this.revealTargets.forEach(el => {
      this.revealObserver.observe(el);
    });
  }

  initCounterObserver() {
    this.counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.animateCounter(entry.target);
          this.counterObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.5
    });

    this.counterTargets.forEach(el => {
      this.counterObserver.observe(el);
    });
  }

  animateCounter(el) {
    const target = parseInt(el.dataset.value, 10);
    const duration = 1800;
    const start = performance.now();

    const step = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased);
      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  }

  toggleMenu() {
    if (this.hasNavLinksTarget && this.hasNavToggleTarget) {
      this.navLinksTarget.classList.toggle("open");
      this.navToggleTarget.classList.toggle("active");
    }
  }

  handleForm(e) {
    e.preventDefault();
    const form = e.target;
    const btn = form.querySelector("button[type='submit']");
    const originalText = btn.textContent;

    btn.textContent = "Sent!";
    btn.style.background = "var(--accent)";
    form.reset();

    setTimeout(() => {
      btn.textContent = originalText;
      btn.style.background = "";
    }, 2500);
  }
});

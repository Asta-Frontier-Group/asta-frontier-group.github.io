const application = Stimulus.Application.start();

application.register("interactive", class extends Stimulus.Controller {
  static targets = ["nav", "navLinks", "navToggle", "reveal", "splitText", "marquee", "stagger", "cursor", "magnetic", "spinner"]

  connect() {
    this.scrollY = 0;
    this.ticking = false;
    this.mouseX = -100;
    this.mouseY = -100;
    this.cursorX = -100;
    this.cursorY = -100;
    this.activeSolution = null;

    this.onScroll = this.onScroll.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);

    window.addEventListener("scroll", this.onScroll, { passive: true });
    window.addEventListener("mousemove", this.onMouseMove, { passive: true });

    this.initSplitText();
    this.initRevealObserver();
    this.initStaggerObserver();
    this.initMagneticElements();
    this.startCursorLoop();

    requestAnimationFrame(() => {
      this.onScroll();
      if (this.hasSpinnerTarget) {
        setTimeout(() => this.spinnerTarget.classList.add("visible"), 1000);
      }
    });
  }

  disconnect() {
    window.removeEventListener("scroll", this.onScroll);
    window.removeEventListener("mousemove", this.onMouseMove);
    if (this.revealObserver) this.revealObserver.disconnect();
    if (this.staggerObserver) this.staggerObserver.disconnect();
    if (this.cursorRaf) cancelAnimationFrame(this.cursorRaf);
  }
  onScroll() {
    this.scrollY = window.scrollY;
    if (!this.ticking) {
      requestAnimationFrame(() => {
        this.updateNav();
        this.ticking = false;
      });
      this.ticking = true;
    }
  }

  onMouseMove(e) {
    this.mouseX = e.clientX;
    this.mouseY = e.clientY;
    /* Custom cursor removed for usability */
  }

  startCursorLoop() {
    /* Custom cursor loop removed */
  }

  updateNav() {
    if (this.hasNavTarget) {
      this.navTarget.classList.toggle("scrolled", this.scrollY > 60);
    }
  }

  initSplitText() {
    if (!this.hasSplitTextTarget) return;

    const el = this.splitTextTarget;
    const html = el.innerHTML;

    const lines = html.split("<br>");
    const processed = lines.map(line => {
      const cleaned = line.trim();
      const emMatch = cleaned.match(/^<em>(.*?)<\/em>$/);

      if (emMatch) {
        const words = emMatch[1].split(/\s+/);
        const inner = words.map(word =>
          `<span class="word"><span class="word-inner">${word}</span></span>`
        ).join(" ");
        return `<em>${inner}</em>`;
      }

      const parts = [];
      let remaining = cleaned;
      const emInline = remaining.match(/(.*?)<em>(.*?)<\/em>(.*)/);

      if (emInline) {
        if (emInline[1].trim()) {
          emInline[1].trim().split(/\s+/).forEach(word => {
            parts.push(`<span class="word"><span class="word-inner">${word}</span></span>`);
          });
        }
        const emWords = emInline[2].trim().split(/\s+/).map(word =>
          `<span class="word"><span class="word-inner">${word}</span></span>`
        ).join(" ");
        parts.push(`<em>${emWords}</em>`);
        if (emInline[3].trim()) {
          emInline[3].trim().split(/\s+/).forEach(word => {
            parts.push(`<span class="word"><span class="word-inner">${word}</span></span>`);
          });
        }
        return parts.join(" ");
      }

      const words = cleaned.split(/\s+/);
      return words.map(word =>
        `<span class="word"><span class="word-inner">${word}</span></span>`
      ).join(" ");
    }).join("<br>");

    el.innerHTML = processed;

    const wordInners = el.querySelectorAll(".word-inner");
    wordInners.forEach((word, i) => {
      setTimeout(() => {
        word.classList.add("visible");
      }, 400 + i * 80);
    });

    const totalDelay = 400 + wordInners.length * 80 + 300;
    setTimeout(() => {
      el.classList.add("animated");
    }, totalDelay);
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
      threshold: 0.12,
      rootMargin: "0px 0px -80px 0px"
    });

    this.revealTargets.forEach(el => {
      this.revealObserver.observe(el);
    });
  }

  initStaggerObserver() {
    this.staggerObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const delay = parseInt(entry.target.dataset.delay || 0, 10);
          setTimeout(() => {
            entry.target.classList.add("visible");
          }, delay * 150);
          this.staggerObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: "0px 0px -60px 0px"
    });

    this.staggerTargets.forEach(el => {
      this.staggerObserver.observe(el);
    });
  }

  initMagneticElements() {
    if (window.innerWidth < 900) return;

    this.magneticTargets.forEach(el => {
      el.addEventListener("mousemove", (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        el.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
      });

      el.addEventListener("mouseleave", () => {
        el.style.transform = "";
        el.style.transition = "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)";
        setTimeout(() => { el.style.transition = ""; }, 500);
      });
    });
  }

  toggleMenu() {
    if (this.hasNavLinksTarget && this.hasNavToggleTarget) {
      this.navLinksTarget.classList.toggle("open");
      this.navToggleTarget.classList.toggle("active");
      this.navTarget.classList.toggle("menu-open");
      document.body.classList.toggle("no-scroll");
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

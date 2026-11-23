"use client";

import { useEffect, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Navigation, Pagination } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import gsap from "gsap";
import Link from "next/link";

import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import "swiper/css/pagination";

export interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  linkUrl: string;
  linkLabel: string;
}

export default function HeroSlider({ slides }: { slides: HeroSlide[] }) {
  const swiperRef = useRef<SwiperType | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  const animateActiveSlide = (swiper: SwiperType) => {
    const activeEl = swiper.slides[swiper.activeIndex];
    if (!activeEl) return;
    const targets = activeEl.querySelectorAll(".kh-anim");
    gsap.fromTo(
      targets,
      { autoAlpha: 0, y: 50 },
      { autoAlpha: 1, y: 0, duration: 1, ease: "power3.out", stagger: 0.12, delay: 0.15 }
    );
    const img = activeEl.querySelector(".kh-hero-img");
    if (img) {
      gsap.fromTo(img, { scale: 1.18 }, { scale: 1, duration: 2.2, ease: "power2.out" });
    }
  };

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".kh-hero-chrome",
        { autoAlpha: 0, y: -20 },
        { autoAlpha: 1, y: 0, duration: 0.8, ease: "power2.out", delay: 0.2 }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={sectionRef} className="relative h-[86vh] min-h-[560px] w-full overflow-hidden bg-ink">
      <Swiper
        modules={[Autoplay, EffectFade, Navigation, Pagination]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        loop
        speed={1100}
        autoplay={{ delay: 5500, disableOnInteraction: false }}
        navigation={{ nextEl: ".kh-hero-next", prevEl: ".kh-hero-prev" }}
        pagination={{ clickable: true, el: ".kh-hero-pagination" }}
        onSwiper={(sw) => {
          swiperRef.current = sw;
          setTimeout(() => animateActiveSlide(sw), 50);
        }}
        onSlideChangeTransitionStart={(sw) => animateActiveSlide(sw)}
        className="h-full w-full"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div className="relative h-full w-full">
              <img
                src={slide.imageUrl}
                alt={slide.title}
                className="kh-hero-img absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20" />
              <div className="absolute inset-0 bg-gradient-to-l from-black/10 via-transparent to-black/60" />
              <div className="container-kh relative z-10 flex h-full flex-col items-start justify-end pb-28 pt-24 text-white md:justify-center md:pb-0">
                <span className="kh-anim section-eyebrow text-white/70">کوشا خودرو | نماینده رسمی کیا</span>
                <h2 className="kh-anim max-w-2xl text-4xl font-black leading-tight md:text-6xl">
                  {slide.title}
                </h2>
                {slide.subtitle && (
                  <p className="kh-anim mt-5 max-w-xl text-base text-white/80 md:text-lg">{slide.subtitle}</p>
                )}
                {slide.linkUrl && (
                  <div className="kh-anim mt-9">
                    <Link href={slide.linkUrl} className="btn-primary bg-white text-ink border-white hover:bg-transparent hover:text-white">
                      {slide.linkLabel}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="kh-hero-chrome absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 items-center gap-6">
        <button className="kh-hero-prev flex h-11 w-11 items-center justify-center rounded-full border border-white/30 text-white transition hover:bg-white hover:text-ink">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6l6 6-6 6" /></svg>
        </button>
        <div className="kh-hero-pagination flex items-center gap-2" />
        <button className="kh-hero-next flex h-11 w-11 items-center justify-center rounded-full border border-white/30 text-white transition hover:bg-white hover:text-ink">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 6l-6 6 6 6" /></svg>
        </button>
      </div>

      <div className="kh-hero-chrome absolute bottom-10 right-5 z-20 hidden flex-col items-center gap-3 md:flex lg:right-10">
        <span className="text-[11px] font-bold tracking-[0.3em] text-white/60 [writing-mode:vertical-rl]">SCROLL</span>
        <span className="h-16 w-px bg-white/30" />
      </div>
    </div>
  );
}

"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import NewsCard from "./NewsCard";
import type { NewsItem } from "@/lib/models/news";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function NewsCarousel({ items }: { items: NewsItem[] }) {
  return (
    <div className="relative">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={24}
        slidesPerView={1.1}
        autoplay={{ delay: 3800, disableOnInteraction: false }}
        navigation={{ nextEl: ".kh-nc-next", prevEl: ".kh-nc-prev" }}
        pagination={{ clickable: true, el: ".kh-nc-pagination" }}
        breakpoints={{
          640: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        }}
        className="kh-carousel !pb-14"
      >
        {items.map((n) => (
          <SwiperSlide key={n.id} className="h-auto">
            <NewsCard item={n} />
          </SwiperSlide>
        ))}
      </Swiper>
      <div className="kh-nc-pagination kh-light-pagination mt-1 flex justify-center gap-2" />
      <div className="pointer-events-none absolute -top-16 left-0 right-0 flex justify-between">
        <button className="kh-nc-prev pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-line transition hover:bg-ink hover:text-white">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6l6 6-6 6" /></svg>
        </button>
        <button className="kh-nc-next pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-line transition hover:bg-ink hover:text-white">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 6l-6 6 6 6" /></svg>
        </button>
      </div>
    </div>
  );
}

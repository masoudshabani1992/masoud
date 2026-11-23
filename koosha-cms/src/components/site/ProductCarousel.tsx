"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import ProductCard from "./ProductCard";
import type { Product } from "@/lib/models/products";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function ProductCarousel({ products }: { products: Product[] }) {
  return (
    <div className="relative">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={24}
        slidesPerView={1.15}
        autoplay={{ delay: 4200, disableOnInteraction: false }}
        navigation={{ nextEl: ".kh-pc-next", prevEl: ".kh-pc-prev" }}
        pagination={{ clickable: true, el: ".kh-pc-pagination" }}
        breakpoints={{
          640: { slidesPerView: 2.1 },
          1024: { slidesPerView: 3.1 },
          1280: { slidesPerView: 4 },
        }}
        className="kh-carousel !pb-14"
      >
        {products.map((p) => (
          <SwiperSlide key={p.id} className="h-auto">
            <ProductCard product={p} />
          </SwiperSlide>
        ))}
      </Swiper>
      <div className="kh-pc-pagination kh-light-pagination mt-1 flex justify-center gap-2" />
      <div className="pointer-events-none absolute -top-16 left-0 right-0 flex justify-between">
        <button className="kh-pc-prev pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-line transition hover:bg-ink hover:text-white">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6l6 6-6 6" /></svg>
        </button>
        <button className="kh-pc-next pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-line transition hover:bg-ink hover:text-white">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 6l-6 6 6 6" /></svg>
        </button>
      </div>
    </div>
  );
}

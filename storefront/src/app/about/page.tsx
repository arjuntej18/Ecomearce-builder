"use client";

import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-transparent text-[#4a2925]">
      <div className="mx-auto max-w-4xl px-6 py-20 sm:px-8 sm:py-28">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#a17b4f]">
            Setetha Vastram
          </p>

          <h1 className="mt-4 font-serif text-4xl font-medium tracking-tight sm:text-6xl">
            Rooted in tradition.
            <br />
            Woven for you.
          </h1>

          <div className="mx-auto mt-6 h-px w-16 bg-[#a17b4f]" />
        </div>

        <div className="mt-16 space-y-10 text-base leading-8 text-[#6d574e] sm:mt-20 sm:text-lg">
          <p>
            Setetha Vastram is a thoughtfully curated destination for
            timeless Indian clothing and traditional craftsmanship.
          </p>

          <p>
            We believe that what you wear should carry more than style.
            It should carry character, culture and a sense of occasion.
          </p>

          <p>
            Our collections are selected with attention to fabric, detail,
            colour and craftsmanship, bringing together pieces that feel
            elegant today while remaining rooted in tradition.
          </p>

          <p>
            From everyday favourites to special-occasion pieces, our aim is
            simple: to make beautiful traditional clothing easier to discover,
            choose and cherish.
          </p>
        </div>

        <div className="mt-16 border-y border-[#d6bda8] py-10 text-center">
          <p className="font-serif text-2xl text-[#4a2925] sm:text-3xl">
            Thoughtfully chosen.
            <br />
            Elegantly worn.
          </p>

          <Link
            href="/shop"
            className="mt-7 inline-flex rounded-full bg-[#72263a] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#5d1e2f]"
          >
            Explore the Collection
          </Link>
        </div>
      </div>
    </main>
  );
}
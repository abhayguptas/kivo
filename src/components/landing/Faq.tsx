"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Plus } from "lucide-react";

export function Faq() {
  const faqs = [
    {
      question: "What is Kivo and how does it work?",
      answer: "Kivo is a localization intelligence SaaS. It ingests multilingual reviews and support feedback, translates with Lingo.dev, and prioritizes opportunities by sentiment, risk, and projected business impact.",
    },
    {
      question: "What can I analyze with Kivo?",
      answer: "You can analyze App Store reviews, support tickets, and webhook payloads in one workspace. Kivo normalizes language and surfaces trend, locale, and impact analytics in one dashboard.",
    },
    {
      question: "How does free vs premium access work?",
      answer: "Free plan gives core analytics and top-5 locale intelligence by workspace volume. Premium unlocks all supported locales, full AI opportunity board, and unlimited executive summaries.",
    },
    {
      question: "Do I need engineering effort to get started?",
      answer: "No-code setup is available for supported integrations, and webhook ingestion takes minimal engineering effort. Teams can move from connection to actionable insights quickly.",
    },
    {
      question: "Why is Lingo.dev important in this workflow?",
      answer: "Lingo.dev powers high-fidelity translation and localization quality in Kivo, so your product team can compare feedback fairly across markets without losing sentiment context.",
    },
  ];

  return (
    <section id="faq" className="kivo-section-light py-24">
      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        <div className="text-center mb-16">
          <p className="mb-2 text-sm font-medium uppercase tracking-wider text-blue-700">FAQ</p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900">
            Frequently Asked Questions
          </h2>
        </div>

        <Accordion className="w-full space-y-4 max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <AccordionItem 
              key={index} 
              value={`item-${index}`}
              className="kivo-card mb-4 overflow-hidden rounded-[24px] border border-slate-200/70 bg-white/70 backdrop-blur-xl transition-all shadow-sm"
            >
              <AccordionTrigger className="hover:no-underline font-medium text-slate-900 text-[17px] text-left py-6 px-8 [&>svg[data-slot=accordion-trigger-icon]]:hidden">
                <span className="flex-1 pr-6">{faq.question}</span>
                <div className="kivo-primary-btn flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white transition-transform duration-300 [[data-state=open]>&]:rotate-45">
                  <Plus className="h-5 w-5" />
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-slate-600 text-base pb-8 px-8 leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

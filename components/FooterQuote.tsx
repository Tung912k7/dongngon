"use client";

import { AnimatePresence, m } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

import { createClient } from "@/utils/supabase/client";

type Quote = {
  id: string;
  text: string;
  author: string;
  source: string | null;
};

type QuoteState =
  | { status: "loading" }
  | { status: "empty" }
  | { status: "error" }
  | { status: "success"; quotes: Quote[]; activeQuoteId: Quote["id"] };

const quoteTextClass =
  "text-pretty font-be-vietnam font-light italic leading-loose tracking-[-0.012em] text-[15px] text-[#2C2B29]/90 max-w-sm";
const quoteAuthorClass =
  "font-be-vietnam font-medium not-italic uppercase tracking-[0.15em] text-[12px] text-[#2C2B29]/50 mt-4";
const quoteWrapperClass =
  "relative flex flex-col items-start bg-transparent border-none p-0";

function renderAuthorLine(author: string) {
  return (
    <footer className="w-full text-left">
      <cite className={`${quoteAuthorClass} block`}>{author}</cite>
    </footer>
  );
}

function pickRandomQuote(quotes: Quote[]) {
  return quotes[Math.floor(Math.random() * quotes.length)];
}

export default function FooterQuote() {
  const supabase = useMemo(() => createClient(), []);
  const [quoteState, setQuoteState] = useState<QuoteState>({ status: "loading" });
  const [shouldLoad, setShouldLoad] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = containerRef.current;

    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "400px 0px" }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!shouldLoad) {
      return;
    }

    let isMounted = true;

    const loadQuote = async () => {
      const { data, error } = await supabase
        .from("quotes")
        .select("id, text, author, source")
        .eq("is_active", true);

      if (!isMounted) {
        return;
      }

      if (error) {
        setQuoteState({ status: "error" });
        return;
      }

      if (!data || data.length === 0) {
        setQuoteState({ status: "empty" });
        return;
      }

      const quotes = data.filter((quote): quote is Quote => {
        return Boolean(quote?.id && quote?.text && quote?.author);
      });

      if (quotes.length === 0) {
        setQuoteState({ status: "empty" });
        return;
      }

      setQuoteState({
        status: "success",
        quotes,
        activeQuoteId: pickRandomQuote(quotes).id,
      });
    };

    void loadQuote();

    return () => {
      isMounted = false;
    };
  }, [shouldLoad, supabase]);

  useEffect(() => {
    if (quoteState.status !== "success" || quoteState.quotes.length <= 1) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setQuoteState((currentState) => {
        if (currentState.status !== "success" || currentState.quotes.length <= 1) {
          return currentState;
        }

        const currentIndex = currentState.quotes.findIndex(
          (quote) => quote.id === currentState.activeQuoteId,
        );
        const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % currentState.quotes.length : 0;

        return {
          status: "success",
          quotes: currentState.quotes,
          activeQuoteId: currentState.quotes[nextIndex]?.id ?? currentState.activeQuoteId,
        };
      });
    }, 60_000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [quoteState]);

  const activeQuote =
    quoteState.status === "success"
      ? quoteState.quotes.find((quote) => quote.id === quoteState.activeQuoteId) ?? quoteState.quotes[0]
      : null;
  const contentKey = quoteState.status === "success" ? activeQuote?.id ?? "success" : quoteState.status;

  return (
    <div
      ref={containerRef}
      aria-live="polite"
      aria-atomic="true"
      aria-busy={!shouldLoad || quoteState.status === "loading"}
      className="min-h-[8rem] w-full text-left"
    >
      <AnimatePresence initial={false} mode="wait">
        {quoteState.status === "success" ? (
          <m.blockquote
            key={contentKey}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
            className={quoteWrapperClass}
          >
            <p className={quoteTextClass}>{activeQuote?.text}</p>
            {renderAuthorLine(activeQuote?.author ?? "Đồng ngôn")}
          </m.blockquote>
        ) : null}

        {quoteState.status === "loading" ? (
          <m.div
            key={contentKey}
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className={quoteWrapperClass}
          >
            <p className={quoteTextClass}>Một câu chữ đang lặng lẽ tìm đường ghé lại.</p>
            {renderAuthorLine("Đồng ngôn")}
          </m.div>
        ) : null}

        {quoteState.status === "empty" ? (
          <m.div
            key={contentKey}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={quoteWrapperClass}
          >
            <p className={quoteTextClass}>Trang này đang yên, câu chữ rồi sẽ trở về.</p>
            {renderAuthorLine("Đồng ngôn")}
          </m.div>
        ) : null}

        {quoteState.status === "error" ? (
          <m.div
            key={contentKey}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={quoteWrapperClass}
          >
            <p className={quoteTextClass}>Hôm nay câu chữ vắng mặt, hẹn bạn vào một nhịp khác.</p>
            {renderAuthorLine("Đồng ngôn")}
          </m.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
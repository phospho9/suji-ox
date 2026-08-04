import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "수지 SUJI | 수능지리 O/X 기출 퀴즈" },
      { name: "description", content: "하루 20선지로 끝내는 수능 세계지리 O/X 기출 퀴즈. 평가원·교육청 최신 기출을 즉시 해설과 오답노트로 복습해요." },
      { name: "author", content: "Lovable" },
      { name: "google-site-verification", content: "fXKwsW4J4eskH9NmhSHK61flkKL8Rh0O0H8C2xIS9lo" },

      { property: "og:title", content: "수지 SUJI | 수능지리 O/X 기출 퀴즈" },
      { property: "og:description", content: "하루 20선지로 끝내는 수능 세계지리 O/X 기출 퀴즈. 평가원·교육청 최신 기출을 즉시 해설과 오답노트로 복습해요." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: "수지 SUJI | 수능지리 O/X 기출 퀴즈" },
      { name: "twitter:description", content: "하루 20선지로 끝내는 수능 세계지리 O/X 기출 퀴즈. 평가원·교육청 최신 기출을 즉시 해설과 오답노트로 복습해요." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/96d1cc06-7a7c-4d6f-b646-da22adb515dd/id-preview-f75ad616--2ba5fea4-9265-4df4-bb5a-f04f04ae5e59.lovable.app-1785491728604.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/96d1cc06-7a7c-4d6f-b646-da22adb515dd/id-preview-f75ad616--2ba5fea4-9265-4df4-bb5a-f04f04ae5e59.lovable.app-1785491728604.png" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Jua&family=Gowun+Dodum&display=swap",
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              "@id": "https://suji.haniw.com/#organization",
              name: "수지 SUJI",
              alternateName: "SUJI",
              url: "https://suji.haniw.com/",
              description:
                "현직 한의사 아빠가 고3 딸을 위해 만든 수능 세계지리 O/X 기출 퀴즈 서비스입니다.",
            },
            {
              "@type": "WebSite",
              "@id": "https://suji.haniw.com/#website",
              name: "수지 SUJI | 수능지리 O/X 기출 퀴즈",
              url: "https://suji.haniw.com/",
              inLanguage: "ko-KR",
              description:
                "하루 20선지로 끝내는 수능 세계지리 O/X 기출 퀴즈. 평가원·교육청 최신 기출을 즉시 해설과 오답노트로 복습해요.",
              publisher: { "@id": "https://suji.haniw.com/#organization" },
            },
            {
              "@type": "LearningResource",
              "@id": "https://suji.haniw.com/#quiz",
              name: "수능 세계지리 O/X 기출 퀴즈",
              url: "https://suji.haniw.com/",
              inLanguage: "ko-KR",
              learningResourceType: "Quiz",
              educationalLevel: "고등학교 3학년",
              educationalUse: "practice",
              about: { "@type": "Thing", name: "수능 세계지리" },
              teaches: "수능 세계지리 기출 선지 판별 및 개념 복습",
              isAccessibleForFree: true,
              provider: { "@id": "https://suji.haniw.com/#organization" },
            },
          ],
        }),
      },
    ],
  }),

  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
      <Toaster position="top-center" />
    </QueryClientProvider>
  );
}

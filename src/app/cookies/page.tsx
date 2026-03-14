import Link from "next/link";

export default function CookiesPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 pb-16 pt-24 text-slate-800">
      <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm md:p-12">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">Legal</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">Cookie Policy</h1>
          <p className="mt-2 text-sm text-slate-500">Last updated: March 14, 2026</p>
        </div>

        <div className="space-y-7 text-sm leading-7 text-slate-700">
          <section>
            <h2 className="text-lg font-semibold text-slate-900">What Are Cookies?</h2>
            <p className="mt-2">
              Cookies are small text files stored in your browser. They help us keep Kivo secure, remember your
              session, and improve product performance.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">How We Use Cookies</h2>
            <p className="mt-2">Kivo may use cookies and similar technologies for:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Authentication and session management</li>
              <li>Security and fraud prevention</li>
              <li>Product analytics and performance monitoring</li>
              <li>Preference storage (for example language or UI settings)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">Third-Party Cookies</h2>
            <p className="mt-2">
              Some providers we rely on (such as auth, analytics, or infrastructure services) may set cookies required
              for their services to function.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">Managing Cookies</h2>
            <p className="mt-2">
              You can manage cookies in your browser settings. Disabling some cookies may affect login and core product
              functionality.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">Updates</h2>
            <p className="mt-2">
              We may update this policy as Kivo evolves. The latest version and update date will always be shown on
              this page.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">Contact</h2>
            <p className="mt-2">
              Questions about cookies? Email{" "}
              <a href="mailto:privacy@kivo.dev" className="font-medium text-blue-700 hover:underline">
                privacy@kivo.dev
              </a>
              .
            </p>
          </section>
        </div>

        <div className="mt-10 border-t border-slate-200 pt-6 text-sm text-slate-600">
          <Link href="/" className="font-medium text-blue-700 hover:underline">
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}

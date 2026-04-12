import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { ValueProps } from "@/components/value-props";
import { SocialProof } from "@/components/social-proof";
import { FAQ } from "@/components/faq";
import { CTAFinal } from "@/components/cta-final";
import { Footer } from "@/components/footer";
import { StickyCTA } from "@/components/sticky-cta";
import { createServerSupabaseClient } from "@/lib/supabase";

async function getWaitlistCount(): Promise<number> {
  try {
    const supabase = createServerSupabaseClient();
    const { count } = await supabase
      .from("waitlist_subscribers")
      .select("*", { count: "exact", head: true });
    return count ?? 0;
  } catch {
    return 0;
  }
}

export default async function Home() {
  const waitlistCount = await getWaitlistCount();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <ValueProps />
        <SocialProof initialCount={waitlistCount} />
        <FAQ />
        <CTAFinal />
      </main>
      <Footer />
      <StickyCTA />
    </div>
  );
}

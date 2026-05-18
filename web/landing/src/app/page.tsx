import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { Footer } from "@/components/footer";
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
        <Hero waitlistCount={waitlistCount} />
      </main>
      <Footer />
    </div>
  );
}

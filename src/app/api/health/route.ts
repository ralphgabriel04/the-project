import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Test the connection by getting the current session
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      return NextResponse.json(
        { 
          status: "error", 
          message: "Supabase connection failed",
          error: error.message 
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      status: "ok",
      message: "Supabase connection successful",
      supabase: {
        connected: true,
        session: data.session ? "active" : "none",
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json(
      { 
        status: "error", 
        message: "Internal server error",
        error: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}


import { NextRequest, NextResponse } from "next/server";
import { getAvailableSlotsForDate } from "@/lib/data-service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const serviceId = searchParams.get("serviceId");
    const date = searchParams.get("date");

    if (!serviceId || !date) {
      return NextResponse.json(
        { error: "Both 'serviceId' and 'date' query parameters are required." },
        { status: 400 }
      );
    }

    // Validate date format YYYY-MM-DD
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { error: "Invalid date format. Expected YYYY-MM-DD." },
        { status: 400 }
      );
    }

    const result = await getAvailableSlotsForDate(serviceId, date);

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error: any) {
    console.error("Availability API Error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to calculate slot availability." },
      { status: 500 }
    );
  }
}

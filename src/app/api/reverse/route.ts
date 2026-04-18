import { NextResponse } from "next/server";

/**
 * Reverse Geocoding API route.
 * Uses Google Maps Geocoding API to convert coordinates into a human-readable address.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("latitude");
  const lng = searchParams.get("longitude");

  if (!lat || !lng) {
    return NextResponse.json(
      { error: "Latitude and longitude are required" },
      { status: 400 }
    );
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    console.error("GOOGLE_MAPS_API_KEY is missing from environment variables.");
    return NextResponse.json({
      data: [{ label: `${lat}, ${lng}` }]
    });
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
    );

    const data = await response.json();

    if (data.status === "OK" && data.results && data.results.length > 0) {
      // Find the most relevant result. index 0 is usually the most specific address.
      // However, for "easy to identify", a shorter name might be better.
      const result = data.results[0];
      
      // We can also try to find a result that is a 'locality' or 'sublocality' for a cleaner name
      const cleanResult = data.results.find((r: any) => 
        r.types.includes("sublocality") || 
        r.types.includes("neighborhood") || 
        r.types.includes("locality")
      ) || result;

      const label = cleanResult.formatted_address || result.formatted_address;
      
      return NextResponse.json({
        data: [{
          label: label,
          name: label,
          locality: cleanResult.address_components.find((c: any) => c.types.includes("locality"))?.long_name,
          city: cleanResult.address_components.find((c: any) => c.types.includes("administrative_area_level_2"))?.long_name,
          region: cleanResult.address_components.find((c: any) => c.types.includes("administrative_area_level_1"))?.long_name,
          country: cleanResult.address_components.find((c: any) => c.types.includes("country"))?.long_name,
        }]
      });
    } else {
      console.error("Google Geocoding API failed. Status:", data.status, "Message:", data.error_message);
      
      // Fallback to OpenStreetMap (Nominatim) if Google fails (e.g. key issue)
      console.log("Attempting fallback to OpenStreetMap Nominatim...");
      const osmResponse = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { 'User-Agent': 'RushNow-App' } }
      );
      
      const osmData = await osmResponse.json();
      if (osmData && osmData.display_name) {
        return NextResponse.json({
          data: [{
            label: osmData.display_name,
            name: osmData.display_name
          }]
        });
      }

      throw new Error(data.status || "Reverse geocode failed");
    }
  } catch (error) {
    console.error("Final reverse geocode error:", error);
    return NextResponse.json({
      data: [{ label: `${lat}, ${lng}` }]
    });
  }
}

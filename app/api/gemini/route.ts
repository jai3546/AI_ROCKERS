export async function POST(req: Request) {
  try {
    const  requestBody  = await req.json();

    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
      return Response.json(
        { error: "Gemini API key not configured" },
        { status: 500 }
      );
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

    const data = await response.json();

    return Response.json(data, {
      status: response.status,
    });
  } catch (error: any) {
    console.error("Gemini API Route Error:", error);

    return Response.json(
      {
        error: error.message || "Gemini request failed",
      },
      { status: 500 }
    );
  }
}
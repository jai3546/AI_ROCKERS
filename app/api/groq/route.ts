export async function POST(req: Request) {
  try {
    const requestBody = await req.json();
    const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;

    if (!apiKey) {
      return Response.json({ error: "Groq API key not configured" }, { status: 500 });
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();
    if (!response.ok) {
      return Response.json(
        { error: data.error?.message || "Groq API request failed" }, 
        { status: response.status }
      );
    }
    return Response.json(data, { status: response.status });

  } catch (error: any) {
    console.error("Groq API Route Error:", error);
    return Response.json({ error: error.message || "Groq request failed" }, { status: 500 });
  }
}
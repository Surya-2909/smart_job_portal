export async function readApiResponse(response) {
  const responseText = await response.text();
  if (!responseText) {
    return null;
  }

  try {
    return JSON.parse(responseText);
  } catch {
    if (response.ok) {
      throw new Error("The server returned an invalid response.");
    }
    return { message: responseText };
  }
}

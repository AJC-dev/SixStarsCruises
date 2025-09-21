import { put } from '@vercel/blob';

export default async function handler(request, response) {
  const { filename } = request.query;

  if (!filename) {
    return response.status(400).json({ message: 'Missing filename.' });
  }

  try {
    // Pass the entire request object to put()
    // Vercel's library will handle extracting the body stream.
    const blob = await put(filename, request, {
      access: 'public',
    });

    return response.status(200).json(blob);
  } catch (error) {
    console.error('Error uploading to Vercel Blob:', error);
    return response.status(500).json({ message: 'Error uploading file.' });
  }
}
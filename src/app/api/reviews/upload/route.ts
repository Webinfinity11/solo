// Upload tokens for review photos/videos. Only signed-in customers get one; files go
// straight from the browser to Vercel Blob under reviews/, and stay hidden until the
// review is approved in the admin.
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { currentCustomer } from "@/lib/customers/auth";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
const VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

export async function POST(request: Request): Promise<Response> {
  const body = (await request.json()) as HandleUploadBody;
  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        if (!(await currentCustomer())) throw new Error("Sign in to upload");
        if (!pathname.startsWith("reviews/")) throw new Error("Invalid path");
        const isVideo = clientPayload === "video";
        return {
          allowedContentTypes: isVideo ? VIDEO_TYPES : IMAGE_TYPES,
          // Photos are downscaled in the browser first; the cap only catches files it could not shrink.
          maximumSizeInBytes: (isVideo ? 15 : 8) * 1024 * 1024,
          addRandomSuffix: true,
        };
      },
    });
    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Upload failed" }, { status: 400 });
  }
}

import { ImagePlus } from "lucide-react";
import { useRef, useState } from "react";
import { useCurrentUser } from "../context/UserContext.jsx";
import { createId, useDashboardData } from "../data/dataStore.js";
import ActionButton from "./ActionButton.jsx";

const MAX_IMAGE_SIZE = 900;
const JPEG_QUALITY = 0.72;

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

async function compressImage(file) {
  const dataUrl = await readFileAsDataUrl(file);
  const image = await loadImage(dataUrl);
  const scale = Math.min(
    1,
    MAX_IMAGE_SIZE / Math.max(image.naturalWidth, image.naturalHeight),
  );
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  canvas.width = width;
  canvas.height = height;
  context.drawImage(image, 0, 0, width, height);

  return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
}

function PhotoFrame({ photo }) {
  const imageUrl = photo.imageUrl || photo.src;
  const label = photo.caption || photo.label || "Memory";

  return (
    <div className="memory-photo-frame">
      {imageUrl ? (
        <img src={imageUrl} alt={label} />
      ) : (
        <div
          className="memory-photo-placeholder"
          style={{ background: photo.gradient }}
        >
          <span>{label}</span>
        </div>
      )}
    </div>
  );
}

export default function MemoryFilmStrip() {
  const inputRef = useRef(null);
  const [uploadStatus, setUploadStatus] = useState("Memories saved locally");
  const { dashboardData, setDashboardData } = useDashboardData();
  const { currentUser } = useCurrentUser();
  const photos = dashboardData.memoryPhotos;
  const scrollingPhotos = [...photos, ...photos];

  const handleAddPhotos = () => {
    inputRef.current?.click();
  };

  const handleUpload = async (event) => {
    if (!currentUser) {
      setUploadStatus("Choose an identity before adding photos.");
      event.target.value = "";
      return;
    }

    const files = Array.from(event.target.files ?? []).filter((file) =>
      ["image/jpeg", "image/png", "image/webp"].includes(file.type),
    );

    if (!files.length) return;

    setUploadStatus("Preparing photos...");

    try {
      const uploadedPhotos = await Promise.all(
        files.map(async (file) => ({
          id: createId("memory"),
          label: file.name.replace(/\.[^/.]+$/, "") || "Memory",
          caption: file.name.replace(/\.[^/.]+$/, "") || "Memory",
          ownerId: currentUser.id,
          uploadedBy: currentUser.name,
          imageUrl: await compressImage(file),
          visibility: "shared",
          locked: true,
          createdAt: new Date().toISOString(),
          uploadedAt: new Date().toISOString(),
        })),
      );

      setDashboardData((data) => {
        data.memoryPhotos = [...uploadedPhotos, ...data.memoryPhotos];
        return data;
      });
      setUploadStatus(`${uploadedPhotos.length} photo${uploadedPhotos.length > 1 ? "s" : ""} saved locally`);
    } catch {
      setUploadStatus("Could not add these photos. Try smaller files.");
    } finally {
      event.target.value = "";
    }
  };

  return (
    <section className="memory-film-card">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-ink">Our Memories</h2>
          <p className="mt-1 text-sm leading-6 text-muted">
            Moments we&apos;ve created together.
          </p>
        </div>
        <ActionButton
          icon={ImagePlus}
          onClick={handleAddPhotos}
          className="w-full sm:w-auto"
        >
          Add Photos
        </ActionButton>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={handleUpload}
        />
      </div>

      <div className="memory-film-strip" aria-label="Our memories film strip">
        <div className="film-perforations" />
        <div className="memory-track-wrap">
          <div className="memory-film-track">
            {scrollingPhotos.map((photo, index) => (
              <PhotoFrame key={`${photo.id}-${index}`} photo={photo} />
            ))}
          </div>
        </div>
        <div className="film-perforations" />
      </div>

      <p className="mt-3 text-xs font-semibold text-muted">{uploadStatus}</p>
    </section>
  );
}

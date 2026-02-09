import { getPhotos } from "@/app/lib/photos";
import { ScatteredPile } from "@/app/components/ScatteredPile";

export default function ScatteredPrintsPage() {
  const photos = getPhotos();
  return <ScatteredPile photos={photos} theme="light" />;
}

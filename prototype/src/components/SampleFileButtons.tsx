import { Button } from "@/components/ui/button"
import { SAMPLE_FILE_IDS, SAMPLE_FILE_NAMES } from "@/data/sample-files"
import type { SampleFileId } from "@/data/wallet-types"

export function SampleFileButtons({
  onPick,
}: {
  onPick: (file: SampleFileId) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {SAMPLE_FILE_IDS.map((file) => (
        <Button
          key={file}
          type="button"
          variant="outline"
          onClick={() => onPick(file)}
        >
          {SAMPLE_FILE_NAMES[file]}
        </Button>
      ))}
    </div>
  )
}

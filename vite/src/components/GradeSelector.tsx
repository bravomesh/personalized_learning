import { Button } from "@/components/ui/button"

export function GradeSelector({ onSelect }: { 
  onSelect: (level: "primary" | "secondary") => void 
}) {
  return (
    <div className="flex gap-4 mb-8">
      <Button onClick={() => onSelect("primary")}>Primary School</Button>
      <Button variant="secondary" onClick={() => onSelect("secondary")}>
        Secondary School
      </Button>
    </div>
  )
}
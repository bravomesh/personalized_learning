import { Button } from "@/components/ui/button";

export function GradeSelector({ onSelect }: { 
  onSelect: (level: "primary" | "secondary") => void 
}) {
  return (
    <div className="flex gap-4 mb-8">
      <Button
        onClick={() => onSelect("primary")}
        className="bg-black text-white hover:bg-gray-700"
      >
        Pre-Primary
      </Button>
      <Button
        onClick={() => onSelect("primary")}
        className="bg-black text-white hover:bg-gray-700"
      >
        Primary
      </Button>
      <Button
        onClick={() => onSelect("secondary")}
        className="bg-gray-500 text-white hover:bg-gray-800"
      >
        Junior Secondary
      </Button>
      <Button
        onClick={() => onSelect("secondary")}
        className="bg-gray-500 text-white hover:bg-gray-800 "
      >
        Senior Secondary
      </Button>
      <Button
        onClick={() => onSelect("secondary")}
        className="bg-gray-500 text-white hover:bg-gray-800"
      >
        University
      </Button>
    </div>
  );
}

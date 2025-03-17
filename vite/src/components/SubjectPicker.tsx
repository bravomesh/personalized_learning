import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function SubjectPicker({ 
  subjects, 
  onSelect 
}: {
  subjects: string[],
  onSelect: (subject: string) => void
}) {
  return (
    <Select onValueChange={onSelect}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Select Subject" />
      </SelectTrigger>
      <SelectContent>
        {subjects.map((subject) => (
          <SelectItem key={subject} value={subject}>
            {subject.charAt(0).toUpperCase() + subject.slice(1)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}